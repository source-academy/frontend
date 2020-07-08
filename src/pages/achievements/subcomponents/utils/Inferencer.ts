import {
  AchievementItem,
  AchievementStatus,
  AchievementGoal,
  FilterStatus
} from 'src/commons/achievements/AchievementTypes';

/**
 * A Node item encapsulates all important information of an achievement item
 *
 * @param {AchievementItem} achievement the achievement item
 * @param {number} dataIdx the key to retrive the achivement item in achievements[], i.e. achievements[dataIdx] = achievement
 * @param {number} exp total achievable EXP of the achievement
 * @param {number} progressBar progress in decimal, min=0, max=1
 * @param {AchievementStatus} status the achievement status
 * @param {Date | undefined} furthestDeadline furthestDeadline of the achievement and all of its descendant prerequities
 * @param {Set<number>} children a set of immediate prerequisites id
 * @param {Set<number>} descendant a set of all descendant prerequisites id (including immediate prerequisites)
 */
class Node {
  achievement: AchievementItem;
  dataIdx: number;
  exp: number;
  progressBar: number;
  status: AchievementStatus;
  furthestDeadline?: Date;
  children: Set<number>;
  descendant: Set<number>;

  constructor(achievement: AchievementItem, dataIdx: number) {
    const { deadline, prerequisiteIds, goals } = achievement;

    this.achievement = achievement;
    this.dataIdx = dataIdx;
    this.exp = this.generateExp(goals);
    this.progressBar = this.generateProgressBar(goals);
    this.status = this.generateStatus(deadline, this.progressBar);
    this.furthestDeadline = deadline;
    this.children = new Set(prerequisiteIds);
    this.descendant = new Set(prerequisiteIds);
  }

  private generateExp(goals: AchievementGoal[]) {
    return goals.reduce((exp, goal) => exp + goal.goalTarget, 0);
  }

  private generateProgressBar(goals: AchievementGoal[]) {
    const progress = goals.reduce((progress, goal) => progress + goal.goalProgress, 0);

    return Math.min(progress / this.exp, 1);
  }

  private generateStatus(deadline: Date | undefined, progressBar: number) {
    if (progressBar === 1) {
      return AchievementStatus.COMPLETED;
    } else if (deadline !== undefined && deadline.getTime() < Date.now()) {
      return AchievementStatus.EXPIRED;
    } else {
      return AchievementStatus.ACTIVE;
    }
  }
}

class Inferencer {
  private achievements: AchievementItem[] = []; // note: the achievement_id might not be the same as its array index
  private nodeList: Map<number, Node> = new Map(); // key = achievement_id, value = achievement node

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
    const hasChild = (achievement: AchievementItem) =>
      achievement.prerequisiteIds.reduce((hasChild, child) => hasChild || child === id, false);

    const removeChild = (achievement: AchievementItem) =>
      achievement.prerequisiteIds.filter(child => child !== id);

    // create a copy of achievements that:
    // 1. does not contain the removed achievement
    // 2. does not contain reference of the removed achievement in other achievement's prerequisite
    const newAchievements: AchievementItem[] = [];

    this.achievements.reduce((arr, parent) => {
      if (parent.id === id) {
        return arr; // removed item not included in the new achievements
      } else if (hasChild(parent)) {
        parent.prerequisiteIds = removeChild(parent); // reference of the removed item is filtered out
      }
      arr.push(parent);
      return arr;
    }, newAchievements);

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

  public getExp(id: number) {
    return this.nodeList.get(id)!.exp;
  }

  // total achievable EXP of all published achievements
  public getTotalExp() {
    const publishedTask = this.listPublishedNodes().filter(node => node.achievement.isTask);

    return publishedTask.reduce((totalExp, node) => totalExp + node.exp, 0);
  }

  // total EXP earned by the student
  public getStudentExp() {
    const publishedTask = this.listPublishedNodes().filter(node => node.achievement.isTask);

    return publishedTask.reduce((totalProgress, node) => {
      const goals = node.achievement.goals;
      const progress = goals.reduce((progress, goal) => progress + goal.goalProgress, 0);
      return totalProgress + progress;
    }, 0);
  }

  public getProgressBar(id: number) {
    return this.nodeList.get(id)!.progressBar;
  }

  public getStatus(id: number) {
    return this.nodeList.get(id)!.status;
  }

  public getFurthestDeadline(id: number) {
    return this.nodeList.get(id)!.furthestDeadline;
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
    }, [] as Node[]);
  }
}

export default Inferencer;
