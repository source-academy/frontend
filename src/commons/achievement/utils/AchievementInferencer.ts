import assert from 'assert';

import {
  AchievementGoal,
  AchievementItem,
  AchievementStatus,
  GoalDefinition
} from '../../../features/achievement/AchievementTypes';
import { isExpired } from './DateHelper';

/**
 * An AchievementNode item encapsulates all important information of an achievement item
 *
 * @param {AchievementItem} achievement the achievement item
 * @param {Date | undefined} displayDeadline deadline displayed on the achievement card
 * @param {number} maxExp total achievable EXP of the achievement
 * @param {number} progressFrac progress percentage in fraction. It is always between 0 to 1, both inclusive.
 * @param {AchievementStatus} status the achievement status
 * @param {Set<number>} children a set of immediate prerequisites id
 * @param {Set<number>} descendant a set of all descendant prerequisites id (including immediate prerequisites)
 */
class AchievementNode {
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
  private nodeList: Map<number, AchievementNode> = new Map(); // key = achievementId, value = AchievementNode
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
  public getAllAchievements() {
    return [...this.nodeList.values()].map(node => node.achievement);
  }

  /**
   * Returns an array of AchievementGoal
   */
  public getAllGoals() {
    return [...this.goalList.values()];
  }

  /**
   * Returns an array of GoalDefinition
   */
  public getAllGoalDefinitions() {
    return this.getAllGoals().map(goal => this.constructGoalDefinition(goal));
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
   * Returns the AchievementGoal
   *
   * @param id Goal Id
   */
  public getGoalDefinition(id: number) {
    assert(this.goalList.has(id));
    return this.constructGoalDefinition(this.goalList.get(id)!);
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
    this.nodeList.set(newId, new AchievementNode(achievement));

    // finally, process the nodeList
    this.processNodes();
    this.normalizePositions(achievement.id);

    return newId;
  }

  /**
   * Inserts a new GoalDefinition into the Inferencer,
   * then returns the newly assigned goalId
   *
   * @param goal the GoalDefinition
   */
  public insertGoalDefinition(goal: GoalDefinition) {
    // first, generate a new unique id by finding the max id
    let newId = 0;
    if (this.goalList.size > 0) {
      newId = Math.max(...this.goalList.keys(), 0) + 1;
    }

    // then assign the new unique id by overwriting the goal item supplied by param
    // and insert it into goalList
    goal.id = newId;
    this.goalList.set(newId, this.constructDefaultGoal(goal));

    return newId;
  }

  /**
   * Updates the AchievementItem in the Inferencer
   *
   * @param achievement the AchievementItem
   */
  public modifyAchievement(achievement: AchievementItem) {
    // directly replace the AchievementNode in nodeList
    this.nodeList.set(achievement.id, new AchievementNode(achievement));

    // then, process the nodeList
    this.processNodes();
    this.normalizePositions(achievement.id);
  }

  /**
   * Updates the GoalDefinition in the Inferencer
   *
   * @param goal the GoalDefinition
   */
  public modifyGoalDefinition(goal: GoalDefinition) {
    // directly replace the GoalDefinition in goalList
    this.goalList.set(goal.id, this.constructDefaultGoal(goal));

    // then, process the nodeList
    this.processNodes();
  }

  /**
   * Removes the AchievementItem from the Inferencer
   *
   * @param targetId Achievement Id
   */
  public removeAchievement(targetId: number) {
    const hasTarget = (node: AchievementNode) => node.children.has(targetId);

    const sanitizeNode = (node: AchievementNode) => {
      const newPrerequisiteIds = node.achievement.prerequisiteIds.filter(id => id !== targetId);
      node.achievement.prerequisiteIds = newPrerequisiteIds;

      return new AchievementNode(node.achievement);
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
    this.normalizePositions();
  }

  /**
   * Removes the GoalDefinition from the Inferencer
   *
   * @param targetId Goal Id
   */
  public removeGoalDefinition(targetId: number) {
    const findTargetIndex = (node: AchievementNode) =>
      node.achievement.goalIds.findIndex(id => id === targetId);

    const sanitizeNode = (node: AchievementNode) => {
      const targetIndex = findTargetIndex(node);
      if (targetIndex !== -1) {
        node.achievement.goalIds.splice(targetIndex, 1);
      }
    };

    // first, remove goal from goal list
    this.goalList.delete(targetId);
    // then, remove reference of the goal in all achievement's goals
    this.nodeList.forEach(node => sanitizeNode(node));

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
    return this.getAllAchievements()
      .filter(achievement => achievement.isTask)
      .map(task => task.id);
  }

  /**
   * Returns a sorted array of achievementId that isTask
   */
  public listTaskIdsbyPosition() {
    return this.getAllAchievements()
      .filter(achievement => achievement.isTask)
      .sort((taskA, taskB) => taskA.position - taskB.position)
      .map(sortedTask => sortedTask.id);
  }

  /**
   * Returns an array of achievementId that not isTask
   */
  public listNonTaskIds() {
    return this.getAllAchievements()
      .filter(achievement => !achievement.isTask)
      .map(nonTask => nonTask.id);
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
    return this.getAllGoals().reduce((totalExp, goal) => totalExp + goal.exp, 0);
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
   * Returns a list of goalId
   */
  public listAllGoalIds() {
    return this.getAllGoals().map(goal => goal.id);
  }

  /**
   * Returns a list of achievementId that may be a prerequisite of the achievement
   *
   * @param id Achievement Id
   */
  public listAvailablePrerequisiteIds(id: number) {
    return this.listIds().filter(
      target => target !== id && !this.isDescendant(id, target) && !this.isDescendant(target, id)
    );
  }

  /**
   * Recalculates the AchievementNode data of each achievements, O(N) operation
   */
  private processNodes() {
    this.nodeList.forEach(node => {
      this.generateDescendant(node);
      this.generateDisplayDeadline(node);
      this.generateMaxExp(node);
      this.generateProgressFrac(node);
      this.generateStatus(node);
    });
  }

  /**
   * Returns a new nodeList constructed based on achievements
   *
   * @param achievements an array of AchievementItem
   */
  private constructNodeList(achievements: AchievementItem[]) {
    const nodeList = new Map<number, AchievementNode>();
    achievements.forEach(achievement =>
      nodeList.set(achievement.id, new AchievementNode(achievement))
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
   * Returns a goal definition based on the AchievementGoal
   *
   * @param goal the AchievementGoal
   */
  private constructGoalDefinition(goal: AchievementGoal) {
    const { id, text, maxExp, meta } = goal;
    const definition: GoalDefinition = { id, text, maxExp, meta };
    return definition;
  }

  /**
   * Returns a default AchievementGoal based on the GoalDefinition
   *
   * @param goal the GoalDefinition
   */
  private constructDefaultGoal(goal: GoalDefinition) {
    const defaultGoal: AchievementGoal = { ...goal, exp: 0, completed: false };
    return defaultGoal;
  }

  /**
   * Recursively append grandchildren's id to children, O(N) operation
   *
   * @param node the AchievementNode
   */
  private generateDescendant(node: AchievementNode) {
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
   * @param node the AchievementNode
   */
  private generateDisplayDeadline(node: AchievementNode) {
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
   * @param node the AchievementNode
   */
  private generateMaxExp(node: AchievementNode) {
    const { goalIds } = node.achievement;
    node.maxExp = goalIds.reduce((maxExp, goalId) => maxExp + this.goalList.get(goalId)!.maxExp, 0);
  }

  private generateProgressFrac(node: AchievementNode) {
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
   * @param node the AchievementNode
   */
  private generateStatus(node: AchievementNode) {
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
   * Reassign the achievement position number without changing their orders.
   * If priorityId is supplied, the achievement will be given order priority
   * when two achievements have the same position number.
   *
   * @param priorityId achievementId
   */
  private normalizePositions(priorityId?: number) {
    const sortedTasks = this.getAllAchievements()
      .filter(achievement => achievement.isTask)
      .sort((taskA, taskB) =>
        taskA.position === taskB.position
          ? taskA.id === priorityId
            ? -1
            : 1
          : taskA.position - taskB.position
      );

    let newPosition = 1;
    sortedTasks.forEach(task => (task.position = newPosition++));
  }
}

export default AchievementInferencer;
