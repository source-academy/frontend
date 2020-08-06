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
 * The AchievementInferencer consumes achievements and goals, then infers useful React props
 *
 * Note: The inferencer is responsible for assigning new IDs to AchievementItem and AchievementGoal
 */
class AchievementInferencer {
  private nodeList: Map<number, InferencerNode> = new Map(); // key = achievementId, value = InferencerNode
  private goalList: Map<number, AchievementGoal> = new Map(); // key = goalId, value = AchievementGoal

  constructor(achievements: AchievementItem[], goals: AchievementGoal[]) {
    this.nodeList = this.constructNodeList(achievements);
    this.goalList = this.constructGoalList(goals);
    this.processNodes();
  }

  /**
   * Returns true if the achievement exists
   *
   * @param id Achievement Id
   */
  public doesAchievementExist(id: number) {
    return this.nodeList.has(id);
  }

  /**
   * Returns an array of AchievementItem
   */
  public getAchievements() {
    return [...this.nodeList.values()].map(node => node.achievement);
  }

  /**
   * Returns the AchievementItem
   *
   * @param id Achievement Id
   */
  public getAchievementItem(id: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.achievement;
  }

  /**
   * Inserts a new AchievementItem into the Inferencer,
   * then returns the newly assigned achievementId
   *
   * @param achievement the AchievementItem
   */
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

  /**
   * Updates the AchievementItem in the Inferencer
   *
   * @param achievement the AchievementItem
   */
  public modifyAchievement(achievement: AchievementItem) {
    // directly replace the InferencerNode in nodeList
    this.nodeList.set(achievement.id, new InferencerNode(achievement));

    // then, process the nodeList
    this.processNodes();
  }

  /**
   * Removes the AchievementItem from the Inferencer
   *
   * @param targetId Achievement Id
   */
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

  /**
   * Returns an array of achievementId
   */
  public listIds() {
    return [...this.nodeList.keys()];
  }

  /**
   * Returns an array of achievementId that isTask
   */
  public listTaskIds() {
    return this.getAchievements()
      .filter(achievement => achievement.isTask)
      .map(task => task.id);
  }

  /**
   * Returns a sorted array of achievementId that isTask
   */
  public listTaskIdsbyPosition() {
    return this.getAchievements()
      .filter(achievement => achievement.isTask)
      .sort((taskA, taskB) => taskA.position - taskB.position)
      .map(sortedTask => sortedTask.id);
  }

  /**
   * Returns an array of achievementId that not isTask
   */
  public listNonTaskIds() {
    return this.getAchievements()
      .filter(achievement => !achievement.isTask)
      .map(nonTask => nonTask.id);
  }

  /**
   * Set the achievement item as isTask
   *
   * @param achievement the AchievementItem
   */
  public setTask(achievement: AchievementItem) {
    achievement.isTask = true;
    achievement.position = this.listTaskIds().length + 1;

    this.modifyAchievement(achievement);
  }

  /**
   * Set the achievement item as not isTask
   *
   * @param achievement the AchievementItem
   */
  public setNonTask(achievement: AchievementItem) {
    achievement.prerequisiteIds = [];
    achievement.isTask = false;
    achievement.position = 0; // position 0 is reserved for non-task achievements

    this.modifyAchievement(achievement);
  }

  /**
   * Returns an array of AchievementGoal which belongs to the achievement
   *
   * @param id Achievement Id
   */
  public getGoals(id: number) {
    assert(this.nodeList.has(id));
    const { goalIds } = this.nodeList.get(id)!.achievement;
    return goalIds.map(goalId => this.goalList.get(goalId)!);
  }

  /**
   * Returns an array of AchievementGoal which belongs to the prerequisites of the achievement
   *
   * @param id Achievement Id
   */
  public getPrerequisiteGoals(id: number) {
    assert(this.nodeList.has(id));

    const childGoalIds: number[] = [];
    for (const childId of this.nodeList.get(id)!.children) {
      const { goalIds } = this.nodeList.get(childId)!.achievement;
      goalIds.forEach(goalId => childGoalIds.push(goalId));
    }

    return childGoalIds.map(goalId => this.goalList.get(goalId)!);
  }

  /**
   * Returns EXP earned from the achievement
   *
   * @param id Achievement Id
   */
  public getExp(id: number) {
    assert(this.nodeList.has(id));
    const { goalIds } = this.nodeList.get(id)!.achievement;
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

  /**
   * Returns the achievement progress percentage in fraction
   *
   * @param id Achievement Id
   */
  public getProgressFrac(id: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.progressFrac;
  }

  /**
   * Returns the achievement status
   *
   * @param id Achievement Id
   */
  public getStatus(id: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.status;
  }

  /**
   * Returns the achievement display deadline
   *
   * @param id Achievement Id
   */
  public getDisplayDeadline(id: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.displayDeadline;
  }

  /**
   * Returns true if the child is a prerequisite of parent achievement
   *
   * @param id Parent Achievement Id
   * @param childId Child Achievement Id
   */
  public isImmediateChild(id: number, childId: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.children.has(childId);
  }

  /**
   * Returns a set of prerequisite id
   *
   * @param id Achievement Id
   */
  public getImmediateChildren(id: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.children;
  }

  /**
   * Returns true if an achievement is a descendant of ancestor achievement
   *
   * @param id Ancestor Achievement Id
   * @param childId Descendant Achievement Id
   */
  public isDescendant(id: number, childId: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.descendant.has(childId);
  }

  /**
   * Returns a set of descendant id
   *
   * @param id Achievement Id
   */
  public getDescendants(id: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.descendant;
  }

  /**
   * Returns a list of achievementId that may be a prerequisite of the achievement
   *
   * @param id Achievement Id
   */
  public listAvailablePrerequisites(id: number) {
    return this.listIds().filter(
      target => target !== id && !this.isDescendant(id, target) && !this.isDescendant(target, id)
    );
  }

  /**
   * Returns the number of achievement which is appearing on the dashboard
   *
   * @param filterStatus Filter Status
   */
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

  /**
   * Changes the position of the achievement
   *
   * Note: positions of achievements are 1-indexed
   *
   * @param achievement the AchievementItem
   * @param newPosition the new position
   */
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

  /**
   * Recalculates the InferencerNode data of each achievements, O(N) operation
   */
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

  /**
   * Returns a new nodeList constructed based on achievements
   *
   * @param achievements an array of AchievementItem
   */
  private constructNodeList(achievements: AchievementItem[]) {
    const nodeList = new Map<number, InferencerNode>();
    achievements.forEach(achievement =>
      nodeList.set(achievement.id, new InferencerNode(achievement))
    );
    return nodeList;
  }

  /**
   * Returns a new goalList constructed based on goals
   *
   * @param goals an array of AchievementGoal
   */
  private constructGoalList(goals: AchievementGoal[]) {
    const goalList = new Map<number, AchievementGoal>();
    goals.forEach(goal => goalList.set(goal.id, goal));
    return goalList;
  }

  /**
   * Recursively append grandchildren's id to children, O(N) operation
   *
   * @param node the InferencerNode
   */
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

  /**
   * Set the node's display deadline by comparing with all descendants' deadlines
   *
   * Note: display deadline is the closest unexpired deadline of all descendants
   *
   * @param node the InferencerNode
   */
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
      const childDeadline = this.nodeList.get(childId)!.achievement.deadline;
      descendantDeadlines.push(childDeadline);
    }

    // Reduces the temporary array to a single Date value
    node.displayDeadline = descendantDeadlines.reduce(compareDeadlines, node.displayDeadline);
  }

  /**
   * Calculates the achievement maximum attainable EXP
   *
   * @param node the InferencerNode
   */
  private generateMaxExp(node: InferencerNode) {
    const { goalIds } = node.achievement;
    node.maxExp = goalIds.reduce((maxExp, goalId) => maxExp + this.goalList.get(goalId)!.maxExp, 0);
  }

  private generateProgressFrac(node: InferencerNode) {
    const { goalIds } = node.achievement;
    const exp = goalIds.reduce((exp, goalId) => exp + this.goalList.get(goalId)!.exp, 0);

    node.progressFrac = node.maxExp === 0 ? 0 : Math.min(exp / node.maxExp, 1);
  }

  /**
   * Generates the achievement status
   *
   * AchievementStatus.COMPLETED if contains goals and all goals completed
   * AchievementStatus.ACTIVE if has at least 1 active descendant
   * AchievementStatus.EXPIRED if none of the above
   *
   * @param node the InferencerNode
   */
  private generateStatus(node: InferencerNode) {
    const { deadline, goalIds } = node.achievement;
    const achievementCompleted =
      goalIds.length !== 0 &&
      goalIds
        .map(goalId => this.goalList.get(goalId)!.completed)
        .reduce((result, goalCompleted) => result && goalCompleted, true);

    // Temporary array of all descendants' deadlines
    const descendantDeadlines = [];
    for (const childId of node.descendant) {
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

  /**
   * Reassign the achievement position number without changing their orders
   */
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

  /**
   * Returns an array of achievementId which is appearing on the dashboard
   */
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
