import assert from 'assert';

import {
  AchievementGoal,
  AchievementItem,
  AchievementStatus,
  FilterStatus
} from '../../../features/achievement/AchievementTypes';
import { isExpired } from './DateHelper';

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
    const { deadline, prerequisiteIds } = achievement;

    this.achievement = achievement;
    this.displayDeadline = deadline;
    this.maxExp = 0;
    this.progressFrac = 0;
    this.status = AchievementStatus.ACTIVE;
    this.children = new Set(prerequisiteIds);
    this.descendant = new Set(prerequisiteIds);
  }
}

/**
 * Note: The inferencer assigns new IDs to AchievementItem and AchievementGoal
 */
class AchievementInferencer {
  private nodeList: Map<number, InferencerNode> = new Map(); // key = achievementId, value = InferencerNode
  private goalList: Map<number, AchievementGoal> = new Map(); // key = goalId, value = AchievementGoal

  constructor(achievements: AchievementItem[], goals: AchievementGoal[]) {
    this.nodeList = this.constructNodeList(achievements);
    this.goalList = this.constructGoalList(goals);
    this.processNodes();
  }

  public doesAchievementExist(id: number) {
    return this.nodeList.has(id);
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
      .map(sortedTask => sortedTask.id);
  }

  public listNonTaskIds() {
    return this.getAchievements()
      .filter(achievement => !achievement.isTask)
      .map(nonTask => nonTask.id);
  }

  public setTask(achievement: AchievementItem) {
    achievement.isTask = true;
    achievement.position = this.listTaskIds().length + 1;

    this.modifyAchievement(achievement);
  }

  public setNonTask(achievement: AchievementItem) {
    achievement.prerequisiteIds = [];
    achievement.isTask = false;
    achievement.position = 0; // position 0 is reserved for non-task achievements

    this.modifyAchievement(achievement);
  }

  public getGoals(id: number) {
    assert(this.nodeList.has(id));
    const { goalIds } = this.nodeList.get(id)!.achievement;
    goalIds.forEach(goalId => assert(this.goalList.has(goalId)));
    return goalIds.map(goalId => this.goalList.get(goalId)!);
  }

  /**
   * Returns EXP earned from the achievement
   *
   * @param id Achievement Id
   */
  public getExp(id: number) {
    assert(this.nodeList.has(id));
    const { goalIds } = this.nodeList.get(id)!.achievement;
    goalIds.forEach(goalId => assert(this.goalList.has(goalId)));
    return goalIds.reduce((exp, goalId) => exp + this.goalList.get(goalId)!.exp, 0);
  }

  /**
   * Returns the maximum attainable EXP from the achievement
   *
   * @param id Achievement Id
   */
  public getMaxExp(id: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.maxExp;
  }

  /**
   * Returns EXP earned from the goal
   *
   * @param goalId Goal Id
   */
  public getGoalExp(goalId: number) {
    assert(this.goalList.has(goalId));
    return this.goalList.get(goalId)!.exp;
  }

  /**
   * Returns the maximum attainable EXP from the goal
   *
   * @param goalId Goal Id
   */
  public getGoalMaxExp(goalId: number) {
    assert(this.goalList.has(goalId));
    return this.goalList.get(goalId)!.maxExp;
  }

  /**
   * Returns total EXP earned from all goals
   */
  public getTotalExp() {
    return [...this.goalList.values()].reduce((totalExp, goal) => totalExp + goal.exp, 0);
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

    const targetAchievement = achievements.splice(achievement.position - 1, 1)[0];
    achievements.splice(newPosition - 1, 0, targetAchievement);

    for (let i = Math.min(newPosition - 1, achievement.position); i < achievements.length; i++) {
      const editedAchievement = achievements[i];
      editedAchievement.position = i + 1;
    }
  }

  private processNodes() {
    this.nodeList.forEach(node => {
      this.generateDescendant(node);
      this.generateDisplayDeadline(node);
      this.generateMaxExp(node);
      this.generateProgressFrac(node);
      this.generateStatus(node);
    });
    this.normalizePositions();
  }

  private constructNodeList(achievements: AchievementItem[]) {
    const nodeList = new Map<number, InferencerNode>();
    achievements.forEach(achievement =>
      nodeList.set(achievement.id, new InferencerNode(achievement))
    );
    return nodeList;
  }

  private constructGoalList(goals: AchievementGoal[]) {
    const goalList = new Map<number, AchievementGoal>();
    goals.forEach(goal => goalList.set(goal.id, goal));
    return goalList;
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
  // Display deadline is the closest unexpired deadline of all descendants
  private generateDisplayDeadline(node: InferencerNode) {
    // Comparator of two deadlines
    const compareDeadlines = (
      displayDeadline: Date | undefined,
      currentDeadline: Date | undefined
    ) => {
      if (currentDeadline === undefined || isExpired(currentDeadline)) {
        // currentDeadline undefined or expired, nothing change
        return displayDeadline;
      } else if (displayDeadline === undefined) {
        return currentDeadline;
      } else {
        // currentDeadline unexpired, displayDeadline may or may not expired
        // hence display the closest unexpired deadline
        return isExpired(displayDeadline) || currentDeadline < displayDeadline
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

  private generateMaxExp(node: InferencerNode) {
    const { goalIds } = node.achievement;
    goalIds.forEach(goalId => console.log(this.goalList.has(goalId)));
    goalIds.forEach(goalId => assert(this.goalList.has(goalId)));
    node.maxExp = goalIds.reduce((maxExp, goalId) => maxExp + this.goalList.get(goalId)!.maxExp, 0);
  }

  private generateProgressFrac(node: InferencerNode) {
    const { goalIds } = node.achievement;
    goalIds.forEach(goalId => assert(this.goalList.has(goalId)));
    const exp = goalIds.reduce((exp, goalId) => exp + this.goalList.get(goalId)!.exp, 0);

    node.progressFrac = node.maxExp === 0 ? 0 : Math.min(exp / node.maxExp, 1);
  }

  // AchievementStatus.COMPLETED if contains goals and all goals completed
  // AchievementStatus.ACTIVE if has at least 1 active descendant
  // AchievementStatus.EXPIRED if none of the above
  private generateStatus(node: InferencerNode) {
    const { deadline, goalIds } = node.achievement;
    goalIds.forEach(goalId => assert(this.goalList.has(goalId)));
    const achievementCompleted =
      goalIds.length !== 0 &&
      goalIds
        .map(goalId => this.goalList.get(goalId)!.completed)
        .reduce((result, goalCompleted) => result && goalCompleted, true);

    // Temporary array of all descendants' deadlines
    const descendantDeadlines = [];
    for (const childId of node.descendant) {
      assert(this.nodeList.has(childId));
      const childDeadline = this.nodeList.get(childId)!.achievement.deadline;
      descendantDeadlines.push(childDeadline);
    }
    const hasUnexpiredDeadline = descendantDeadlines.reduce(
      (result, deadline) => result || !isExpired(deadline),
      !isExpired(deadline)
    );

    if (achievementCompleted) {
      node.status = AchievementStatus.COMPLETED;
    } else if (hasUnexpiredDeadline) {
      node.status = AchievementStatus.ACTIVE;
    } else {
      node.status = AchievementStatus.EXPIRED;
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
        assert(this.nodeList.has(id));
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
