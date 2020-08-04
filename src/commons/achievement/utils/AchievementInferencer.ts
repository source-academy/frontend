import assert from 'assert';

import {
  AchievementGoal,
  AchievementItem,
  AchievementStatus,
  FilterStatus
} from '../../../features/achievement/AchievementTypes';

/**
 * An InferencerNode item encapsulates all important information of an achievement item
 *
 * @param {AchievementItem} achievement the achievement item
 * @param {Date | undefined} displayDeadline deadline displayed on the achievement card
 * @param {number} maxExp total achievable EXP of the achievement
 * @param {number} progressFrac progress percentage in fraction. It is always between 0 to 1, both inclusive.
 * @param {AchievementStatus} status the achievement status
 * @param {Set<number>} children a set of immediate prerequisites id
 * @param {Set<number>} descendant a set of all descendant prerequisites id (including immediate prerequisites)
 */
class InferencerNode {
  public achievement: AchievementItem;
  public displayDeadline?: Date;
  public maxExp: number;
  public progressFrac: number;
  public status: AchievementStatus;
  public children: Set<number>;
  public descendant: Set<number>;

  constructor(achievement: AchievementItem) {
    const { deadline, prerequisiteIds, goals } = achievement;

    this.achievement = achievement;
    this.displayDeadline = deadline;
    this.maxExp = this.generateMaxExp(goals);
    this.progressFrac = this.generateProgressFrac(goals);
    this.status = AchievementStatus.ACTIVE; // will be updated after the nodeList is constructed
    this.children = new Set(prerequisiteIds);
    this.descendant = new Set(prerequisiteIds);
  }

  private generateMaxExp(goals: AchievementGoal[]) {
    return goals.reduce((exp, goal) => exp + goal.goalTarget, 0);
  }

  private generateProgressFrac(goals: AchievementGoal[]) {
    const progress = goals.reduce((progress, goal) => progress + goal.goalProgress, 0);

    return this.maxExp === 0 ? 0 : Math.min(progress / this.maxExp, 1);
  }
}

/**
 * Note: The inferencer assigns new IDs to AchievementItem and AchievementGoal
 */
class AchievementInferencer {
  private nodeList: Map<number, InferencerNode> = new Map(); // key = achievementId, value = InferencerNode

  constructor(achievements: AchievementItem[]) {
    this.nodeList = this.constructNodeList(achievements);
    this.processNodes();
  }

  public doesAchievementExist(id: number) {
    return this.nodeList.get(id) !== undefined;
  }

  public getAchievements() {
    return [...this.nodeList.values()].map(node => node.achievement);
  }

  public getAchievementItem(id: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.achievement;
  }

  public insertAchievement(achievement: AchievementItem) {
    // first, generate a new unique id by finding the max id
    let newId = 0;
    if (this.nodeList.size > 0) {
      newId = Math.max(...this.nodeList.keys(), 0) + 1;
    }

    // then assign the new unique id by overwriting the achievement item supplied by param
    // and insert it into nodeList
    achievement.id = newId;
    this.nodeList.set(newId, new InferencerNode(achievement));

    // finally, process the nodeList
    this.processNodes();

    return newId;
  }

  public modifyAchievement(achievement: AchievementItem) {
    // directly replace the InferencerNode in nodeList
    assert(this.nodeList.has(achievement.id));
    this.nodeList.set(achievement.id, new InferencerNode(achievement));

    // then, process the nodeList
    this.processNodes();
  }

  public removeAchievement(targetId: number) {
    const hasTarget = (node: InferencerNode) => node.children.has(targetId);

    const sanitizeNode = (node: InferencerNode) => {
      const newPrerequisiteIds = node.achievement.prerequisiteIds.filter(id => id !== targetId);
      node.achievement.prerequisiteIds = newPrerequisiteIds;

      return new InferencerNode(node.achievement);
    };

    // first, remove achievement from node list
    this.nodeList.delete(targetId);
    // then, remove reference of the target in other achievement's prerequisite
    this.nodeList.forEach((node, id) => {
      if (hasTarget(node)) {
        this.nodeList.set(id, sanitizeNode(node));
      }
    });

    // finally, process the nodeList
    this.processNodes();
  }

  public listIds() {
    return [...this.nodeList.keys()];
  }

  public listTaskIds() {
    return this.getAchievements()
      .filter(achievement => achievement.isTask)
      .map(task => task.id);
  }

  public listTaskIdsbyPosition() {
    return this.getAchievements()
      .filter(achievement => achievement.isTask)
      .sort((taskA, taskB) => taskA.position - taskB.position)
      .map(task => task.id);
  }

  public listNonTaskIds() {
    return this.getAchievements()
      .filter(achievement => !achievement.isTask)
      .map(nonTask => nonTask.id);
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

  // Calculates set bonus
  public getBonusExp(id: number) {
    assert(this.nodeList.has(id));
    if (this.nodeList.get(id)!.children.size === 0) return 0;

    const maxExp = this.nodeList.get(id)!.maxExp;

    let maxChildExp = 0;
    for (const childId of this.nodeList.get(id)!.children) {
      maxChildExp = maxChildExp + this.nodeList.get(childId)!.maxExp;
    }

    return maxExp - maxChildExp;
  }

  public getMaxExp(id: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.maxExp;
  }

  public getStudentExp(id: number) {
    assert(this.nodeList.has(id));
    const goals = this.nodeList.get(id)!.achievement.goals;

    return goals.reduce((progress, goal) => progress + goal.goalProgress, 0);
  }

  // total achievable EXP of all published achievements
  public getTotalExp() {
    const publishedTask = this.listPublishedNodes().filter(node => node.achievement.isTask);

    return publishedTask.reduce((totalExp, node) => totalExp + node.maxExp, 0);
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
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.progressFrac;
  }

  public getStatus(id: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.status;
  }

  public getDisplayDeadline(id: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.displayDeadline;
  }

  public isImmediateChild(id: number, childId: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.children.has(childId);
  }

  public getImmediateChildren(id: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.children;
  }

  public listImmediateChildren(id: number) {
    return [...this.getImmediateChildren(id)];
  }

  public isDescendant(id: number, childId: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.descendant.has(childId);
  }

  public getDescendants(id: number) {
    assert(this.nodeList.has(id));
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

  // NOTE: positions of achievements are 1-indexed.
  public changeAchievementPosition(achievement: AchievementItem, newPosition: number) {
    const achievements = this.getAchievements()
      .filter(achievement => achievement.isTask)
      .sort((taskA, taskB) => taskA.position - taskB.position);

    const movedAchievement = achievements.splice(achievement.position - 1, 1)[0];
    achievements.splice(newPosition - 1, 0, movedAchievement);

    for (let i = Math.min(newPosition - 1, achievement.position); i < achievements.length; i++) {
      const editedAchievement = achievements[i];
      editedAchievement.position = i + 1;
    }
  }

  private processNodes() {
    this.nodeList.forEach(node => {
      this.generateDescendant(node);
      this.generateDisplayDeadline(node);
      this.generateStatus(node);
    });
  }

  private constructNodeList(achievements: AchievementItem[]) {
    const nodeList = new Map();
    achievements.forEach(achievement =>
      nodeList.set(achievement.id, new InferencerNode(achievement))
    );
    return nodeList;
  }

  // Recursively append grandchildren's id to children, O(N) operation
  private generateDescendant(node: InferencerNode) {
    for (const childId of node.descendant) {
      if (childId === node.achievement.id) {
        console.error('Circular dependency detected');
      }
      assert(this.nodeList.has(childId));
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
      if (currentDeadline === undefined || currentDeadline <= now) {
        // currentDeadline undefined or expired, nothing change
        return displayDeadline;
      } else if (displayDeadline === undefined) {
        return currentDeadline;
      } else {
        // currentDeadline unexpired, displayDeadline may be expired or unexpired
        // display the closest unexpired deadline
        return displayDeadline <= now || currentDeadline < displayDeadline
          ? currentDeadline
          : displayDeadline;
      }
    };

    // Temporary array of all descendants' deadlines
    const descendantDeadlines = [];
    for (const childId of node.descendant) {
      assert(this.nodeList.has(childId));
      const childDeadline = this.nodeList.get(childId)!.achievement.deadline;
      descendantDeadlines.push(childDeadline);
    }

    // Reduces the temporary array to a single Date value
    node.displayDeadline = descendantDeadlines.reduce(compareDeadlines, node.displayDeadline);
  }

  private generateStatus(node: InferencerNode) {
    const now = new Date();
    const deadline = node.displayDeadline;
    if (deadline !== undefined && deadline.getTime() <= now.getTime()) {
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
    const posToId = new Map<number, number>();
    this.getAchievements().forEach(achievement =>
      posToId.set(achievement.position, achievement.id)
    );

    const sortedPosToId = [...posToId.entries()].sort();

    let newPosition = 1;
    for (const [pos, id] of sortedPosToId) {
      if (pos !== 0) {
        this.nodeList.get(id)!.achievement.position = newPosition++;
      }
    }
  }

  private listPublishedNodes() {
    // returns an array of Node that are published to the achievement page
    return this.listTaskIds().reduce((arr, id) => {
      assert(this.nodeList.has(id));
      const node = this.nodeList.get(id)!;
      arr.push(node); // including task achievement
      for (const child of node.children) {
        assert(this.nodeList.has(child));
        arr.push(this.nodeList.get(child)!); // including immediate prerequisites
      }
      return arr;
    }, [] as InferencerNode[]);
  }
}

export default AchievementInferencer;
