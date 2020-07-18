import {
  AchievementGoal,
  AchievementItem,
  AchievementStatus,
  FilterStatus
} from '../../../../../commons/achievement/AchievementTypes';

/**
 * An InferencerNode item encapsulates all important information of an achievement item
 *
 * @param {AchievementItem} achievement the achievement item
 * @param {number} dataIdx the key to retrive the achivement item in achievements[], i.e. achievements[dataIdx] = achievement
 * @param {number} displayExp total achievable EXP of the achievement
 * @param {number} progressFrac progress percentage in fraction
 * @param {AchievementStatus} status the achievement status
 * @param {Date | undefined} displayDeadline deadline displayed on the achievement card & modal
 * @param {Set<number>} children a set of immediate prerequisites id
 * @param {Set<number>} descendant a set of all descendant prerequisites id (including immediate prerequisites)
 */
class InferencerNode {
  public achievement: AchievementItem;
  public dataIdx: number;
  public displayExp: number;
  public progressFrac: number;
  public status: AchievementStatus;
  public displayDeadline?: Date;
  public children: Set<number>;
  public descendant: Set<number>;

  constructor(achievement: AchievementItem, dataIdx: number) {
    const { deadline, prerequisiteIds, goals } = achievement;

    this.achievement = achievement;
    this.dataIdx = dataIdx;
    this.displayExp = this.generateDisplayExp(goals);
    this.progressFrac = this.generateProgressFrac(goals);
    this.status = AchievementStatus.ACTIVE; // to be updated after the nodeList is constructed
    this.displayDeadline = deadline;
    this.children = new Set(prerequisiteIds);
    this.descendant = new Set(prerequisiteIds);
  }

  private generateDisplayExp(goals: AchievementGoal[]) {
    return goals.reduce((exp, goal) => exp + goal.goalTarget, 0);
  }

  private generateProgressFrac(goals: AchievementGoal[]) {
    const progress = goals.reduce((progress, goal) => progress + goal.goalProgress, 0);

    return Math.min(progress / this.displayExp, 1);
  }
}

class AchievementInferencer {
  private achievements: AchievementItem[] = []; // note: the achievement_id might not be the same as its array index
  private nodeList: Map<number, InferencerNode> = new Map(); // key = achievement_id, value = achievement node

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

  public getAchievementItem(id: number) {
    // asserts: the achievement id already exist in nodeList
    return this.nodeList.get(id)!.achievement;
  }

  public insertAchievement(achievement: AchievementItem) {
    // first, generate a new unique id by finding the max id
    let newId = 0;
    if (this.achievements.length > 0) {
      newId = [...this.nodeList.keys()].reduce((maxId, curId) => Math.max(maxId, curId), 0) + 1;
    }

    // then assign the new unique id by overwriting the achievement item supplied by param
    // and append it to achievements[]
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
    const hasChild = (achievement: AchievementItem) => achievement.prerequisiteIds.includes(id);

    const removeChild = (achievement: AchievementItem) =>
      achievement.prerequisiteIds.filter(child => child !== id);

    // create a copy of achievements that:
    // 1. does not contain the removed achievement
    // 2. does not contain reference of the removed achievement in other achievement's prerequisite
    const newAchievements: AchievementItem[] = [];
    this.achievements.forEach(parent => {
      if (hasChild(parent)) {
        // reference of the removed item is filtered out
        parent.prerequisiteIds = removeChild(parent);
      }
      if (parent.id !== id) {
        // removed achievement is not included in the new achievements
        newAchievements.push(parent);
      }
    });
    this.achievements = newAchievements;

    // finally, reconstruct the nodeList
    this.processData();
  }

  public listIds() {
    return this.achievements.map(achievement => achievement.id);
  }

  public listTaskIds() {
    return this.achievements.reduce((taskIds, achievement) => {
      if (achievement.isTask) {
        taskIds.push(achievement.id);
      }
      return taskIds;
    }, [] as number[]);
  }

  public listTaskIdsbyPosition() {
    const tasks = this.listTaskIds().map(id => this.getAchievementItem(id));

    tasks.sort((a, b) => a.position - b.position);
    return tasks.map(task => task.id);
  }

  public listNonTaskIds() {
    return this.achievements.reduce((nonTaskIds, achievement) => {
      if (!achievement.isTask) {
        nonTaskIds.push(achievement.id);
      }
      return nonTaskIds;
    }, [] as number[]);
  }

  public setTask(achievement: AchievementItem) {
    achievement.isTask = true;
    achievement.position = this.listTaskIds().length;

    this.modifyAchievement(achievement);
    this.normalizePositions();
  }

  public setNonTask(achievement: AchievementItem) {
    achievement.prerequisiteIds = [];
    achievement.isTask = false;
    achievement.position = 0; // position 0 is reserved for non-task achievements

    this.modifyAchievement(achievement);
    this.normalizePositions();
  }

  public getDisplayExp(id: number) {
    return this.nodeList.get(id)!.displayExp;
  }

  public getStudentExp(id: number) {
    const goals = this.nodeList.get(id)!.achievement.goals;

    return goals.reduce((progress, goal) => progress + goal.goalProgress, 0);
  }

  // total achievable EXP of all published achievements
  public getTotalExp() {
    const publishedTask = this.listPublishedNodes().filter(node => node.achievement.isTask);

    return publishedTask.reduce((totalExp, node) => totalExp + node.displayExp, 0);
  }

  // total EXP earned by the student
  public getStudentTotalExp() {
    const publishedTask = this.listPublishedNodes().filter(node => node.achievement.isTask);

    return publishedTask.reduce((totalProgress, node) => {
      const goals = node.achievement.goals;
      const progress = goals.reduce((progress, goal) => progress + goal.goalProgress, 0);
      return totalProgress + progress;
    }, 0);
  }

  public getProgressFrac(id: number) {
    return this.nodeList.get(id)!.progressFrac;
  }

  public getStatus(id: number) {
    return this.nodeList.get(id)!.status;
  }

  public getDisplayDeadline(id: number) {
    return this.nodeList.get(id)!.displayDeadline;
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

  public getFilterCount(filterStatus: FilterStatus) {
    const published = this.listPublishedNodes();

    switch (filterStatus) {
      case FilterStatus.ALL:
        return published.length;
      case FilterStatus.ACTIVE:
        return published.filter(node => node.status === AchievementStatus.ACTIVE).length;
      case FilterStatus.COMPLETED:
        return published.filter(node => node.status === AchievementStatus.COMPLETED).length;
      default:
        return 0;
    }
  }

  // TODO: Replace swap operation with insert
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
      this.generateDisplayDeadline(node);
      this.generateStatus(node);
    });
  }

  private constructNodeList() {
    this.nodeList = new Map();
    for (let idx = 0; idx < this.achievements.length; idx++) {
      const achievement = this.achievements[idx];
      this.nodeList.set(achievement.id, new InferencerNode(achievement, idx));
    }
  }

  // Recursively append grandchildren's id to children, O(N) operation
  private generateDescendant(node: InferencerNode) {
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

  // Set the node's display deadline by comparing with all descendants' deadlines
  private generateDisplayDeadline(node: InferencerNode) {
    const now = new Date();

    // Comparator of two deadlines
    const compareDeadlines = (
      displayDeadline: Date | undefined,
      currentDeadline: Date | undefined
    ) => {
      if (currentDeadline === undefined) {
        return displayDeadline;
      } else if (displayDeadline === undefined) {
        return currentDeadline;
      } else {
        return now < currentDeadline && currentDeadline <= displayDeadline
          ? currentDeadline
          : displayDeadline;
      }
    };

    // Temporary array of all descendants' deadlines
    const descendantDeadlines = [];
    for (const childId of node.descendant) {
      const childDeadline = this.nodeList.get(childId)!.achievement.deadline;
      descendantDeadlines.push(childDeadline);
    }
    descendantDeadlines.sort();

    // Reduces the temporary array to a single Date value
    node.displayDeadline = descendantDeadlines.reduce(compareDeadlines, node.displayDeadline);
  }

  private generateStatus(node: InferencerNode) {
    const now = new Date();
    const deadline = node.displayDeadline;
    if (deadline !== undefined && deadline.getTime() < now.getTime()) {
      // deadline elapsed
      if (node.progressFrac === 0) {
        return (node.status = AchievementStatus.EXPIRED); // not attempted
      } else {
        return (node.status = AchievementStatus.COMPLETED); // attempted
      }
    } else {
      // deadline not elapsed
      if (node.progressFrac === 1) {
        return (node.status = AchievementStatus.COMPLETED); // fully completed
      } else {
        return (node.status = AchievementStatus.ACTIVE); // not fully completed
      }
    }
  }

  // normalize positions
  private normalizePositions() {
    this.achievements.sort((a, b) => a.position - b.position);

    // position 0 is reserved for non-task achievements
    const nonTaskPosition = 0;
    let newPosition = 1;

    for (let idx = 0; idx < this.achievements.length; idx++) {
      if (this.achievements[idx].isTask) {
        this.achievements[idx].position = newPosition++;
      } else {
        this.achievements[idx].position = nonTaskPosition;
      }
    }
  }

  private listPublishedNodes() {
    // returns an array of Node that are published to the achievement page
    return this.listTaskIds().reduce((arr, id) => {
      const node = this.nodeList.get(id)!;
      arr.push(node); // including task achievement
      for (const child of node.children) {
        arr.push(this.nodeList.get(child)!); // including immediate prerequisites
      }
      return arr;
    }, [] as InferencerNode[]);
  }
}

export default AchievementInferencer;
