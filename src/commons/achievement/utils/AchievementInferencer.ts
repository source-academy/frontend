import { cloneDeep, uniq } from 'lodash';
import { v4 } from 'uuid';

import {
  AchievementGoal,
  AchievementItem,
  AchievementStatus,
  defaultGoalProgress,
  GoalDefinition,
  GoalProgress,
  GoalType
} from '../../../features/achievement/AchievementTypes';
import { showDangerMessage } from '../../utils/notifications/NotificationsHelper';
import { isExpired, isReleased } from './DateHelper';

/**
 * An AchievementNode item encapsulates all important information of an achievement item
 *
 * @param {AchievementItem} achievement the achievement item
 * @param {Date | undefined} displayDeadline deadline displayed on the achievement card
 * @param {number} xp attained XP of the achievement
 * @param {number} progressFrac progress percentage in fraction. It is always between 0 to 1, both inclusive.
 * @param {AchievementStatus} status the achievement status
 * @param {Set<string>} children a set of immediate prerequisites uuid
 * @param {Set<string>} descendant a set of all descendant prerequisites uuid (including immediate prerequisites)
 * @param {Set<string>} parents a set of all immediate parent uuid
 */
class AchievementNode {
  public achievement: AchievementItem;
  public displayDeadline?: Date;
  public xp: number;
  public progressFrac: number;
  public status: AchievementStatus;
  public children: Set<string>;
  public descendant: Set<string>;
  public parents: Set<string>;

  constructor(achievement: AchievementItem) {
    const { deadline, prerequisiteUuids } = achievement;

    this.achievement = achievement;
    this.displayDeadline = deadline;
    this.xp = 0;
    this.progressFrac = 0;
    this.status = AchievementStatus.ACTIVE;
    this.children = new Set(prerequisiteUuids);
    this.descendant = new Set(prerequisiteUuids);
    this.parents = new Set();
  }
}

/**
 * The AchievementInferencer consumes achievements and goals, then infers useful React props
 *
 * Note: The inferencer is responsible for assigning new UUIDs to AchievementItem and AchievementGoal
 */
class AchievementInferencer {
  private nodeList: Map<string, AchievementNode> = new Map(); // key = achievementUuid, value = AchievementNode
  private goalList: Map<string, AchievementGoal> = new Map(); // key = goalUuid, value = AchievementGoal
  private textToUuid: Map<string, string> = new Map(); // key = goalText, value = goalUuid
  private titleToUuid: Map<string, string> = new Map(); // key = achievementTitle, value = achievementUuid
  private achievementsToDelete: string[] = [];
  private goalsToDelete: string[] = [];

  constructor(achievements: AchievementItem[], goals: AchievementGoal[]) {
    this.nodeList = this.constructNodeList(achievements);
    this.goalList = this.constructGoalList(goals);
    this.processNodes();
    this.processGoals();
  }

  /**
   * Invalid Goal for the getters to return if the goal does not exist in the goalList
   */
  private invalidGoal: AchievementGoal = {
    uuid: 'invalid',
    text: 'invalid',
    achievementUuids: [],
    meta: { type: GoalType.MANUAL, targetCount: 0 },
    count: 0,
    targetCount: 0,
    completed: false
  };

  /**
   * Invalid Achievement for the getters to return if the goal does not exist in the goalList
   */
  private invalidAchievement: AchievementItem = {
    uuid: 'invalid',
    title: 'invalid',
    xp: 0,
    isVariableXp: false,
    deadline: undefined,
    release: undefined,
    isTask: false,
    position: 0,
    prerequisiteUuids: [],
    goalUuids: [],
    cardBackground: 'invalid',
    view: { coverImage: 'invalid', description: 'invalid', completionText: 'invalid' }
  };

  /**
   * Returns an array of AchievementItem
   */
  public getAllAchievements() {
    return [...this.nodeList.values()].map(node => node.achievement);
  }

  /**
   * Returns an array of AchievementItem that have been released
   */
  public getAllReleasedAchievements() {
    return [...this.nodeList.values()]
      .filter(node => node.status !== AchievementStatus.UNRELEASED)
      .map(node => node.achievement);
  }

  public getAllCompletedAchievements() {
    return [...this.nodeList.values()]
      .filter(node => node.status === AchievementStatus.COMPLETED)
      .map(node => node.achievement);
  }

  /**
   * Returns an array of achievementUuid
   */
  public getAllAchievementUuids() {
    return [...this.nodeList.keys()];
  }

  /**
   * Returns an array of AchievementGoal
   */
  public getAllGoals() {
    return [...this.goalList.values()];
  }

  /**
   * Returns an array of goalUuid
   */
  public getAllGoalUuids() {
    return [...this.goalList.keys()];
  }

  /**
   * Returns true if achievement exists
   */
  public hasAchievement(uuid: string) {
    return this.nodeList.has(uuid);
  }

  /**
   * Returns true if the achievement is a prerequisite of another achievement
   *
   * @param uuid Achievement uuid
   */
  public isPrerequisite(uuid: string) {
    const node = this.nodeList.get(uuid);
    return node ? node.parents.size > 0 : false;
  }

  /**
   * Returns the AchievementItem
   * Returns an invalid achievement item if the achievement is not in the map
   *
   * @param uuid Achievement Uuid
   */
  public getAchievement(uuid: string) {
    const node = this.nodeList.get(uuid);
    return node ? node.achievement : this.invalidAchievement;
  }

  /**
   * Returns true if goal exists
   */
  public hasGoal(uuid: string) {
    return this.goalList.has(uuid);
  }

  /**
   * Returns the AchievementGoal
   * Returns an invalid goal if the goal is not in the map
   *
   * @param uuid Goal Uuid
   */
  public getGoal(uuid: string) {
    return this.goalList.get(uuid) || this.invalidGoal;
  }

  /**
   * Returns the GoalDefinition
   *
   * @param uuid Goal Uuid
   */
  public getGoalDefinition(uuid: string) {
    return this.getGoal(uuid) as GoalDefinition;
  }

  public getGoalProgress(uuid: string) {
    return this.getGoal(uuid) as GoalProgress;
  }

  /**
   * Returns the position of the achievement
   *
   * @param uuid Achievement Uuid
   */
  public getAchievementPositionByUuid(uuid: string) {
    return this.getAchievement(uuid).position;
  }

  /**
   * Returns the uuids of the achievements that were deleted
   */
  public getAchievementsToDelete() {
    return this.achievementsToDelete;
  }

  /**
   * Returns the uuids of the goals that were deleted
   */
  public getGoalsToDelete() {
    return this.goalsToDelete;
  }

  /**
   * Resets the array so the same achievement/goal is not deleted twice
   */
  public resetToDelete() {
    this.achievementsToDelete = [];
    this.goalsToDelete = [];
  }

  /**
   * Returns an array of achievements that use the goal
   *
   * @param goalUuid UUID of the goal in question
   */
  public getAchievementsByGoal(goalUuid: string) {
    return this.getGoal(goalUuid).achievementUuids;
  }

  public listSortedAchievementUuids() {
    return this.getAllAchievements()
      .sort((a, b) => a.position - b.position)
      .map(achievement => achievement.uuid);
  }

  /**
   * Returns true if the goal is invalid
   *
   * @param goal An AchievementGoal
   */
  public isInvalidGoal(goal: AchievementGoal) {
    return goal === this.invalidGoal;
  }

  /**
   * Returns true if the achievement is invalid
   *
   * @param achievement An AchievementItem
   */
  public isInvalidAchievement(achievement: AchievementItem) {
    return achievement === this.invalidAchievement;
  }

  /**
   * Inserts a new AchievementItem into the Inferencer,
   * then returns the newly assigned achievementUuid
   *
   * @param achievement the AchievementItem
   */
  public insertAchievement(achievement: AchievementItem) {
    // first, generate a new unique uuid
    let newUuid = v4();
    // a small overhead to truly guarantee uniqueness
    while (this.nodeList.has(newUuid)) {
      newUuid = v4();
    }

    // then assign the new unique uuid by overwriting the achievement item supplied by param
    // and insert it into nodeList
    achievement.uuid = newUuid;

    this.nodeList.set(newUuid, new AchievementNode(achievement));

    // finally, process the nodeList
    this.processNodes();
    this.normalizePositions(achievement.uuid, achievement.position);
    return newUuid;
  }

  /**
   * Inserts a new AchievementItem into the Inferencer,
   * then returns the newly assigned achievementUuid.
   * Used for inserting assessment achievements on the fly.
   *
   * @param achievement the AchievementItem
   */
  public insertFakeAchievement(achievement: AchievementItem) {
    // and insert it into nodeList
    this.nodeList.set(achievement.uuid, new AchievementNode(achievement));

    // finally, process the nodeList
    this.processNodes();
    this.normalizePositions(achievement.uuid, achievement.position);

    return achievement.uuid;
  }

  /**
   * Inserts a new GoalDefinition into the Inferencer,
   * then returns the newly assigned goalUuid
   *
   * @param definition the GoalDefinition
   */
  public insertGoalDefinition(definition: GoalDefinition) {
    // first, generate a new unique uuid by finding the max uuid
    let newUuid = v4();
    // a small overhead to truly guarantee uniqueness
    while (this.goalList.has(newUuid)) {
      newUuid = v4();
    }

    // then assign the new unique uuid by overwriting the goal item supplied by param
    // and insert it into goalList
    definition.uuid = newUuid;
    this.goalList.set(newUuid, { ...definition, ...defaultGoalProgress });

    // finally, process the goalList
    this.processGoals();

    return newUuid;
  }

  /**
   * Inserts a new GoalDefinition into the Inferencer,
   * then returns the newly assigned goalUuid
   * Used for inserting assessment goals on the fly
   *
   * @param definition the GoalDefinition
   * @param complete whether the goal should be marked as completed or not
   */
  public insertFakeGoalDefinition(definition: GoalDefinition, complete: boolean) {
    // then assign the new unique uuid by overwriting the goal item supplied by param
    // and insert it into goalList
    if (complete) {
      this.goalList.set(definition.uuid, {
        ...definition,
        count: 1,
        targetCount: 1,
        completed: true
      });
    } else {
      this.goalList.set(definition.uuid, {
        ...definition,
        count: 0,
        targetCount: 1,
        completed: false
      });
    }

    // finally, process the goalList
    this.processGoals();

    return definition.uuid;
  }

  /**
   * Updates the AchievementItem in the Inferencer
   *
   * @param achievement the AchievementItem
   */
  public modifyAchievement(achievement: AchievementItem) {
    // directly replace the AchievementNode in nodeList
    this.nodeList.set(achievement.uuid, new AchievementNode(achievement));

    // then, process the nodeList
    this.processNodes();
    this.normalizePositions(achievement.uuid, achievement.position);
  }

  /**
   * Updates the GoalDefinition in the Inferencer
   *
   * @param definition the GoalDefinition
   */
  public modifyGoalDefinition(definition: GoalDefinition) {
    // directly replace the GoalDefinition in goalList
    this.goalList.set(definition.uuid, { ...definition, ...defaultGoalProgress });

    // then, process the nodeList and goalList
    this.processNodes();
    this.processGoals();
  }

  public modifyGoalProgress(progress: GoalProgress) {
    const goal = this.getGoal(progress.uuid);
    if (this.isInvalidGoal(goal)) {
      return;
    }
    this.goalList.set(progress.uuid, { ...goal, ...progress });

    const achievementUuids = goal.achievementUuids;
    for (const uuid in achievementUuids) {
      const node = this.nodeList.get(uuid);
      if (node) {
        this.generateXp(node);
        this.generateProgressFrac(node);
        this.generateStatus(node);
      }
    }
  }

  /**
   * Removes the AchievementItem from the Inferencer
   *
   * @param targetUuid Achievement Uuid
   */
  public removeAchievement(targetUuid: string) {
    const hasTarget = (node: AchievementNode) => node.children.has(targetUuid);

    const sanitizeNode = (node: AchievementNode) => {
      const newPrerequisiteUuids = node.achievement.prerequisiteUuids.filter(
        uuid => uuid !== targetUuid
      );
      node.achievement.prerequisiteUuids = newPrerequisiteUuids;

      return new AchievementNode(node.achievement);
    };

    // first, remove achievement from node list
    this.nodeList.delete(targetUuid);
    // then, remove reference of the target in other achievement's prerequisite
    this.nodeList.forEach((node, uuid) => {
      if (hasTarget(node)) {
        this.nodeList.set(uuid, sanitizeNode(node));
      }
    });

    // add the achievement to the list of things to delete
    this.achievementsToDelete.push(targetUuid);

    // finally, process the nodeList
    this.processNodes();
    this.normalizePositions();
  }

  /**
   * Removes the GoalDefinition from the Inferencer
   *
   * @param targetUuid Goal Uuid
   */
  public removeGoalDefinition(targetUuid: string) {
    const findTargetIndex = (node: AchievementNode) =>
      node.achievement.goalUuids.findIndex(uuid => uuid === targetUuid);

    const sanitizeNode = (node: AchievementNode) => {
      const targetIndex = findTargetIndex(node);
      if (targetIndex !== -1) {
        node.achievement.goalUuids.splice(targetIndex, 1);
      }
    };

    // first, remove goal from goal list
    this.goalList.delete(targetUuid);
    // then, remove the goalUuid from all achievement goalUuids
    this.nodeList.forEach(node => sanitizeNode(node));

    // add the goal to the list of things to delete
    this.goalsToDelete.push(targetUuid);

    // finally, process the nodeList and goalList
    this.processNodes();
    this.processGoals();
  }

  /**
   * Returns an array of achievementUuid that isTask or is completed
   */
  public listTaskUuids() {
    return this.getAllAchievements()
      .filter(achievement => achievement.isTask || this.isCompleted(achievement))
      .map(task => task.uuid);
  }

  /**
   * Returns an array of achievementId that isTask or is completed sorted by position
   */
  public listSortedTaskUuids() {
    return this.getAllAchievements()
      .filter(achievement => achievement.isTask || this.isCompleted(achievement))
      .sort((taskA, taskB) => taskA.position - taskB.position)
      .map(sortedTask => sortedTask.uuid);
  }

  /**
   * Returns an array of achievementId that isTask or is completed sorted by position
   */
  public listSortedReleasedTaskUuids() {
    return this.getAllReleasedAchievements()
      .filter(achievement => achievement.isTask || this.isCompleted(achievement))
      .sort((taskA, taskB) => taskA.position - taskB.position)
      .map(sortedTask => sortedTask.uuid);
  }

  /**
   * Returns an array of achievementId sorted by position
   */
  public listAllSortedAchievementUuids() {
    return this.getAllAchievements()
      .sort((taskA, taskB) => taskA.position - taskB.position)
      .map(sortedTask => sortedTask.uuid);
  }

  /**
   * Returns whether an achievement is completed or not.
   *
   * NOTE: It might be better (more efficient) to simply have a completed proporty on each achievement.
   */
  public isCompleted(achievement: AchievementItem) {
    const goalLength = achievement.goalUuids.length;
    const prereqLength = achievement.prerequisiteUuids.length;

    // an achievement with no goals and prerequisites should not be considered complete
    if (goalLength === 0 && prereqLength === 0) {
      return false;
    }

    // if any of the goals are not complete, return false
    for (let i = 0; i < goalLength; i++) {
      if (!this.getGoal(achievement.goalUuids[i]).completed) {
        return false;
      }
    }
    // if any of the prereqs are not complete, return false
    for (let i = 0; i < prereqLength; i++) {
      if (!this.isCompleted(this.getAchievement(achievement.prerequisiteUuids[i]))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns an array of AchievementGoal which belongs to the achievement
   *
   * @param uuid Achievement Uuid
   */
  public listGoals(uuid: string) {
    const { goalUuids } = this.getAchievement(uuid);
    return goalUuids.map(goalUuid => this.getGoal(goalUuid));
  }

  /**
   * Returns an array of AchievementGoal which belongs to the prerequisites of the achievement
   *
   * @param uuid Achievement Uuid
   */
  public listPrerequisiteGoals(uuid: string) {
    const childGoalUuids: string[] = [];
    for (const childUuid of this.getImmediateChildren(uuid)) {
      const { goalUuids } = this.getAchievement(childUuid);
      goalUuids.forEach(goalUuid => childGoalUuids.push(goalUuid));
    }

    return childGoalUuids.map(goalUuid => this.getGoal(goalUuid));
  }

  /**
   * Returns the Goal Uuid associate to the Goal Text or undefined
   *
   * @param text goalText
   */
  public getUuidByText(text: string) {
    return this.textToUuid.get(text);
  }

  /**
   * Returns the Goal Text associate to the Goal Uuid or undefined
   *
   * @param text goalUuid
   */
  public getTextByUuid(uuid: string) {
    return this.getGoal(uuid).text;
  }

  /**
   * Returns the Achievement Uuid associate to the Achievement Title or undefined
   *
   * @param title achievementTitle
   */
  public getUuidByTitle(title: string) {
    return this.titleToUuid.get(title);
  }

  /**
   * Returns the Achievement Title associate to the Achievement Uuid or undefined
   *
   * @param text achievementUuid
   */
  public getTitleByUuid(uuid: string) {
    return this.getAchievement(uuid).title;
  }

  /**
   * Returns XP earned from the achievement
   *
   * @param uuid Achievement Uuid
   */
  public getAchievementXp(uuid: string) {
    const achievement = this.getAchievement(uuid);
    if (achievement.isVariableXp) {
      return this.listGoals(achievement.uuid).reduce((xp, goal) => xp + goal.count, 0);
    } else {
      return achievement.xp;
    }
  }

  /**
   * Returns total XP earned from all achievements
   */
  public getTotalXp() {
    return this.getAllCompletedAchievements().reduce(
      (totalXp, achievement) => totalXp + this.getAchievementXp(achievement.uuid),
      0
    );
  }

  /**
   * Returns the achievement progress percentage in fraction
   *
   * @param uuid Achievement Uuid
   */
  public getProgressFrac(uuid: string) {
    return this.nodeList.has(uuid) ? this.nodeList.get(uuid)!.progressFrac : 0;
  }

  /**
   * Returns the achievement status
   *
   * @param uuid Achievement Uuid
   */
  public getStatus(uuid: string) {
    return this.nodeList.has(uuid) ? this.nodeList.get(uuid)!.status : AchievementStatus.ACTIVE;
  }

  /**
   * Returns the achievement display deadline
   *
   * @param uuid Achievement Uuid
   */
  public getDisplayDeadline(uuid: string) {
    return this.nodeList.has(uuid) ? this.nodeList.get(uuid)!.displayDeadline : undefined;
  }

  /**
   * Returns true if the child is a prerequisite of parent achievement
   *
   * @param uuid Parent Achievement Uuid
   * @param childUuid Child Achievement Uuid
   */
  public isImmediateChild(uuid: string, childUuid: string) {
    return this.nodeList.has(uuid) ? this.nodeList.get(uuid)!.children.has(childUuid) : false;
  }

  /**
   * Returns a set of prerequisite uuid
   *
   * @param uuid Achievement Uuid
   */
  public getImmediateChildren(uuid: string) {
    return this.nodeList.has(uuid) ? this.nodeList.get(uuid)!.children : new Set<string>();
  }

  /**
   * Returns true if an achievement is a descendant of ancestor achievement
   *
   * @param uuid Ancestor Achievement Uuid
   * @param childUuid Descendant Achievement Uuid
   */
  public isDescendant(uuid: string, childUuid: string) {
    return this.nodeList.has(uuid) ? this.nodeList.get(uuid)!.descendant.has(childUuid) : false;
  }

  /**
   * Returns a set of descendant uuid
   *
   * @param uuid Achievement Uuid
   */
  public getDescendants(uuid: string) {
    return this.nodeList.has(uuid) ? this.nodeList.get(uuid)!.descendant : new Set<string>();
  }

  /**
   * Returns the total XP of the achievement and all its descendants
   *
   * @param uuid Achievement uuid
   */
  public getDescendantXp(uuid: string) {
    let totalXp = this.getAchievementXp(uuid);

    this.getDescendants(uuid).forEach(descendantUuid => {
      if (this.isCompleted(this.getAchievement(descendantUuid))) {
        totalXp += this.getAchievementXp(descendantUuid);
      }
    });

    return totalXp;
  }

  /**
   * Returns a list of achievementUuid that may be a prerequisite of the achievement
   *
   * @param uuid Achievement Uuid
   */
  public listAvailablePrerequisiteUuids(uuid: string) {
    return this.getAllAchievementUuids().filter(
      target =>
        target !== uuid && !this.isDescendant(uuid, target) && !this.isDescendant(target, uuid)
    );
  }

  /**
   * Recalculates the AchievementNode data of each achievements, O(N) operation
   */
  private processNodes() {
    this.titleToUuid = new Map();

    this.nodeList.forEach(node => {
      const { title, uuid } = node.achievement;
      this.titleToUuid.set(title, uuid);

      node.achievement.prerequisiteUuids = uniq(node.achievement.prerequisiteUuids);
      node.achievement.goalUuids = uniq(node.achievement.goalUuids);

      this.generateParentReference(node);
      this.generateDescendant(node);
      this.generateDisplayDeadline(node);
      this.generateXp(node);
      this.generateProgressFrac(node);
      this.generateStatus(node);
    });
  }

  private processGoals() {
    this.textToUuid = new Map();

    this.goalList.forEach(goal => {
      const { text, uuid } = goal;
      this.textToUuid.set(text, uuid);
      goal.achievementUuids = uniq(goal.achievementUuids);
    });
  }

  /**
   * Returns a new nodeList constructed based on achievements
   *
   * @param achievements an array of AchievementItem
   */
  private constructNodeList(achievements: AchievementItem[]) {
    const nodeList = new Map<string, AchievementNode>();
    achievements.forEach(achievement =>
      nodeList.set(achievement.uuid, new AchievementNode(cloneDeep(achievement)))
    );
    return nodeList;
  }

  /**
   * Returns a new goalList constructed based on goals
   *
   * @param goals an array of AchievementGoal
   */
  private constructGoalList(goals: AchievementGoal[]) {
    const goalList = new Map<string, AchievementGoal>();
    goals.forEach(goal => goalList.set(goal.uuid, cloneDeep(goal)));
    return goalList;
  }

  /**
   * Mark immediate children's parent as this node
   *
   * @param node The AchievementNode
   */
  private generateParentReference(node: AchievementNode) {
    // Mark immediate childeren
    for (const childUuid of node.children) {
      this.nodeList.get(childUuid)?.parents.add(node.achievement.uuid);
    }
  }

  /**
   * Recursively append grandchildren's uuid to children, O(N) operation
   *
   * @param node the AchievementNode
   */
  private generateDescendant(node: AchievementNode) {
    for (const childUuid of node.descendant) {
      if (childUuid === node.achievement.uuid) {
        const { title } = node.achievement;
        // Note: not the best error handling practice, but as long as admin verifies the
        // data in AchievementPreview and do not publish new achievements with circular
        // dependency error, it should be suffice
        showDangerMessage(`Circular dependency detected in achievement ${title}`, 30000);
      }
      for (const grandchildUuid of this.getDescendants(childUuid)) {
        // Newly added grandchild is appended to the back of the set.
        node.descendant.add(grandchildUuid);
        // Hence the great grandchildren will be added when the iterator reaches there
      }
    }
  }

  /**
   * Set the node's display deadline by comparing with all descendants' deadlines
   *
   * Displays the closest unexpired deadline of all descendants. If none (e.g. descendant
   * deadlines are expired or undefined), then display the node's own deadline
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
    const descendantDeadlines: (Date | undefined)[] = [];
    for (const childUuid of node.descendant) {
      const childDeadline = this.getAchievement(childUuid).deadline;
      descendantDeadlines.push(childDeadline);
    }

    // Reduces the temporary array to a single Date value
    node.displayDeadline = descendantDeadlines.reduce(compareDeadlines, node.displayDeadline);
  }

  /**
   * Calculates the achievement attained XP
   *
   * @param node the AchievementNode
   */
  private generateXp(node: AchievementNode) {
    const { goalUuids, isVariableXp } = node.achievement;
    const allGoalsCompleted = goalUuids.reduce(
      (completion, goalUuid) => completion && this.getGoal(goalUuid).completed,
      true
    );
    node.xp = allGoalsCompleted
      ? isVariableXp
        ? goalUuids.reduce((xp, goalUuid) => xp + this.getGoal(goalUuid).count, 0)
        : node.achievement.xp
      : 0;
  }

  /**
   * Calculates the achievement progress percentage between [0..1]
   *
   * @param node the AchievementNode
   */
  private generateProgressFrac(node: AchievementNode) {
    const { goalUuids } = node.achievement;
    if (goalUuids.length === 0) {
      node.progressFrac = 0;
    } else {
      const num = goalUuids.reduce((count, goalUuid) => count + this.getGoal(goalUuid).count, 0);
      const denom = goalUuids.reduce(
        (count, goalUuid) => count + this.getGoal(goalUuid).targetCount,
        0
      );
      node.progressFrac = Math.min(denom === 0 ? 0 : num / denom, 1);
    }
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
    // checks if the achievement's goals and prereqs are complete
    const achievementCompleted = this.isCompleted(node.achievement);

    const hasReleased = isReleased(node.achievement.release);
    const hasUnexpiredDeadline = !isExpired(node.displayDeadline);

    node.status = achievementCompleted
      ? AchievementStatus.COMPLETED
      : hasReleased
        ? hasUnexpiredDeadline
          ? AchievementStatus.ACTIVE
          : AchievementStatus.EXPIRED
        : AchievementStatus.UNRELEASED;
  }

  /**
   * Reassign the achievement position number without changing their orders.
   * If anchorUuid and anchorPosition is supplied, the anchor achievement is
   * guaranteed to have its position set at anchorPosition.
   *
   * @param anchorUuid anchor achievementUuid
   * @param anchorPosition anchor position
   */
  private normalizePositions(anchorUuid?: string, anchorPosition?: number) {
    let newPosition = 1;
    this.getAllAchievements()
      .filter(achievement => achievement.isTask)
      .filter(achievement => achievement.position >= 0) // force negative position tasks to show up on top
      .sort((taskA, taskB) => taskA.position - taskB.position)
      .forEach(sortedTask => (sortedTask.position = newPosition++));
    this.getAllAchievements()
      .filter(achievement => !achievement.isTask)
      .forEach(nonTask => (nonTask.position = 0));

    // If some achievement got misplaced at the anchorPosition, swap it
    // back with the anchor achievement
    if (anchorUuid && anchorPosition && anchorPosition !== 0) {
      const anchorAchievement = this.getAchievement(anchorUuid);
      const newPosition = anchorAchievement.position;
      if (newPosition !== anchorPosition) {
        const misplacedAchievement = this.getAllAchievements().find(
          achievement => achievement.position === anchorPosition
        );
        if (misplacedAchievement) {
          misplacedAchievement.position = newPosition;
          anchorAchievement.position = anchorPosition;
        }
      }
    }
  }
}

export default AchievementInferencer;
