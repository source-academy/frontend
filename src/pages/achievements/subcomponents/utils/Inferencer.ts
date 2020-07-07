import {
  AchievementItem,
  AchievementStatus,
  AchievementModalItem,
  FilterStatus,
  AchievementGoal
} from '../../../../commons/achievements/AchievementTypes';

// A Node item encapsulates all important information of an achievement item
class Node {
  achievement: AchievementItem;
  dataIdx: number; // achievements[dataIdx] = achievement
  exp: number;
  progress: number;
  status: AchievementStatus;
  furthestDeadline?: Date;
  children: Set<number>; // immediate prerequisite
  descendant: Set<number>; // all descendant prerequisites including immediate prerequisites
  modal: AchievementModalItem;

  constructor(achievement: AchievementItem, dataIdx: number) {
    const { deadline, prerequisiteIds, goals, modal } = achievement;

    this.achievement = achievement;
    this.dataIdx = dataIdx;
    this.exp = goals.reduce((acc, goal) => acc + goal.goalTarget, 0);
    this.progress = this.generateProgress(goals);
    this.status = this.generateStatus(deadline, this.progress);
    this.furthestDeadline = deadline;
    this.children = new Set(prerequisiteIds);
    this.descendant = new Set(prerequisiteIds);
    this.modal = modal;
  }

  private generateProgress(goals: AchievementGoal[]) {
    const totalProgress = goals.reduce((acc, goal) => acc + goal.goalProgress, 0);
    const totalTarget = goals.reduce((acc, goal) => acc + goal.goalTarget, 0);

    return Math.min(totalProgress / totalTarget, 1);
  }

  private generateStatus(deadline: Date | undefined, progress: number) {
    if (progress === 1) {
      return AchievementStatus.COMPLETED;
    } else if (deadline !== undefined && deadline.getTime() < Date.now()) {
      return AchievementStatus.EXPIRED;
    } else {
      return AchievementStatus.ACTIVE;
    }
  }
}

class Inferencer {
  private achievements: AchievementItem[] = [];
  private nodeList: Map<number, Node> = new Map(); // key = achievement id

  constructor(achievements: AchievementItem[]) {
    this.achievements = achievements;
    this.processData();
  }

  public doesAchievementExist(id: number) {
    return this.nodeList.get(id) !== undefined;
  }

  public getAchievements() {
    return this.achievements;
  }

  public getAchievementsByPosition() {
    const sortedAchievements = [...this.achievements].sort((a, b) => a.position - b.position);
    return sortedAchievements;
  }

  public getAchievementItem(id: number) {
    // asserts: the achievement id already exist in nodeList
    return this.nodeList.get(id)!.achievement;
  }

  public insertAchievement(achievement: AchievementItem) {
    // first, generate a new unique id
    let newId = 0;
    if (this.achievements.length > 0) {
      newId = [...this.nodeList.keys()].reduce((acc, cur) => Math.max(acc, cur), 0) + 1;
    }

    // then assign the new unique id by overwriting the achievement item
    // and append it to achievements
    achievement.id = newId;
    this.achievements.push(achievement);

    // finally, reconstruct the nodeList
    this.processData();

    return newId;
  }

  public modifyAchievement(achievement: AchievementItem) {
    // directly modify the achievement element in achievements
    // asserts: the achievement id already exists in nodeList
    const idx = this.nodeList.get(achievement.id)!.dataIdx;
    this.achievements[idx] = achievement;

    // then, reconstruct the nodeList
    this.processData();
  }

  public removeAchievement(id: number) {
    const hasChild = (achievement: AchievementItem) =>
      achievement.prerequisiteIds.reduce((acc, child) => acc || child === id, false);

    const removeChild = (achievement: AchievementItem) =>
      achievement.prerequisiteIds.filter(child => child !== id);

    // create a copy of achievements that:
    // 1. does not contain the removed achievement
    // 2. does not contain reference of the removed achievement in other achievement's prerequisite
    const newachievements: AchievementItem[] = [];

    this.achievements.reduce((acc, parent) => {
      if (parent.id === id) {
        return acc; // removed item not included in the new achievements
      } else if (hasChild(parent)) {
        parent.prerequisiteIds = removeChild(parent); // reference of the removed item is filtered out
      }
      acc.push(parent);
      return acc;
    }, newachievements);

    this.achievements = newachievements;

    // finally, reconstruct the nodeList
    this.processData();
  }

  public listIds() {
    return this.achievements.map(achievement => achievement.id);
  }

  public listTaskIds() {
    return this.getAchievementsByPosition().reduce((acc, achievement) => {
      if (achievement.isTask) {
        acc.push(achievement.id);
      }
      return acc;
    }, [] as number[]);
  }

  public setTask(achievement: AchievementItem) {
    achievement.isTask = true;
    achievement.position = this.listTaskIds().length;

    this.modifyAchievement(achievement);

    this.normalizePositions();
  }

  public listNonTaskIds() {
    return this.achievements.reduce((acc, achievement) => {
      if (!achievement.isTask) {
        acc.push(achievement.id);
      }
      return acc;
    }, [] as number[]);
  }

  public setNonTask(achievement: AchievementItem) {
    achievement.prerequisiteIds = [];
    achievement.isTask = false;
    achievement.position = 0;

    this.modifyAchievement(achievement);

    this.normalizePositions();
  }

  public getStatus(id: number) {
    return this.nodeList.get(id)!.status;
  }

  public getTotalExp(id: number) {
    return this.nodeList.get(id)!.exp;
  }

  public getFurthestDeadline(id: number) {
    return this.nodeList.get(id)!.furthestDeadline;
  }

  public getProgress(id: number) {
    return this.nodeList.get(id)!.progress;
  }

  public isImmediateChild(id: number, childId: number) {
    return this.nodeList.get(id)!.children.has(childId);
  }

  public getImmediateChildren(id: number) {
    return this.nodeList.get(id)!.children;
  }

  public listImmediateChildren(id: number) {
    return [...this.getImmediateChildren(id)];
  }

  public isDescendant(id: number, childId: number) {
    return this.nodeList.get(id)!.descendant.has(childId);
  }

  public getDescendants(id: number) {
    return this.nodeList.get(id)!.descendant;
  }

  public listDescendants(id: number) {
    return [...this.getDescendants(id)];
  }

  public listAvailablePrerequisites(id: number) {
    return this.listIds().filter(
      target => target !== id && !this.isDescendant(id, target) && !this.isDescendant(target, id)
    );
  }

  public getModalItem(id: number) {
    return id < 0 ? undefined : this.nodeList.get(id)!.modal;
  }

  public getFilterCount(filterStatus: FilterStatus) {
    switch (filterStatus) {
      case FilterStatus.ALL:
        return this.nodeList.size;
      case FilterStatus.ACTIVE:
        return [...this.nodeList.values()].filter(node => node.status === AchievementStatus.ACTIVE)
          .length;
      case FilterStatus.COMPLETED:
        return [...this.nodeList.values()].filter(
          node => node.status === AchievementStatus.COMPLETED
        ).length;
      default:
        return 0;
    }
  }

  public insertAchievementPosition(oldPosition: number, newPosition: number) {
    const taskIds = this.listTaskIds();

    if (oldPosition < newPosition) {
      for (let i = oldPosition - 1; i < newPosition - 1; i++) {
        this.swapAchievementPositions(
          this.getAchievementItem(taskIds[i]),
          this.getAchievementItem(taskIds[i + 1])
        );
      }
    } else {
      for (let i = newPosition - 1; i < oldPosition - 1; i++) {
        this.swapAchievementPositions(
          this.getAchievementItem(taskIds[i]),
          this.getAchievementItem(taskIds[i + 1])
        );
      }
    }
  }

  public swapAchievementPositions(achievement1: AchievementItem, achievement2: AchievementItem) {
    [achievement1.position, achievement2.position] = [achievement2.position, achievement1.position];

    this.modifyAchievement(achievement1);
    this.modifyAchievement(achievement2);
  }

  private processData() {
    this.constructNodeList();
    this.nodeList.forEach(node => {
      this.generateDescendant(node);
      this.generateFurthestDeadline(node);
    });
  }

  private constructNodeList() {
    this.nodeList = new Map();
    for (let idx = 0; idx < this.achievements.length; idx++) {
      const achievement = this.achievements[idx];
      this.nodeList.set(achievement.id, new Node(achievement, idx));
    }
  }

  // Recursively append grandchildren's id to children, O(N) operation
  private generateDescendant(node: Node) {
    for (const childId of node.descendant) {
      if (childId === node.achievement.id) {
        console.error('Circular dependency detected');
      }
      for (const grandchildId of this.nodeList.get(childId)!.descendant) {
        // Newly added grandchild is appended to the back of the set.
        node.descendant.add(grandchildId);
        // Hence the great grandchildren will be added when the iterator reaches there
      }
    }
  }

  // Set the node's furthest deadline by comparing with all descendants' deadlines
  private generateFurthestDeadline(node: Node) {
    // Comparator of two deadlines
    const compareDeadlines = (
      furthestDeadline: Date | undefined,
      currentDeadline: Date | undefined
    ) => {
      if (currentDeadline === undefined) {
        return furthestDeadline;
      } else if (furthestDeadline === undefined) {
        return currentDeadline;
      } else {
        return furthestDeadline >= currentDeadline ? furthestDeadline : currentDeadline;
      }
    };

    // Temporary array of all descendants' deadlines
    const descendantDeadlines = [];
    for (const childId of node.descendant) {
      const childDeadline = this.nodeList.get(childId)!.achievement.deadline;
      descendantDeadlines.push(childDeadline);
    }

    // Reduces the temporary array to a single Date value
    node.furthestDeadline = descendantDeadlines.reduce(compareDeadlines, node.furthestDeadline);
  }

  // normalize positions
  private normalizePositions() {
    this.achievements.sort((a, b) => a.position - b.position);

    // position 0 is reserved for non-task achievements
    const nonTaskPosition = 0;
    let newPosition = 1;

    for (let i = 0; i < this.achievements.length; i++) {
      if (this.achievements[i].isTask) {
        this.achievements[i].position = newPosition;
        newPosition++;
      } else {
        this.achievements[i].position = nonTaskPosition;
      }
    }
  }
}

export default Inferencer;
