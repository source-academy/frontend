import { uniq } from 'lodash';
import { v4 } from 'uuid';

import { showDangerMessage } from '../../../commons/utils/NotificationsHelper';
import {
  AchievementGoal,
  AchievementItem,
  AchievementStatus,
  defaultGoalProgress,
  GoalDefinition
} from '../../../features/achievement/AchievementTypes';
import { isExpired } from './DateHelper';

/**
 * An AchievementNode item encapsulates all important information of an achievement item
 *
 * @param {AchievementItem} achievement the achievement item
 * @param {Date | undefined} displayDeadline deadline displayed on the achievement card
 * @param {number} xp attained XP of the achievement
 * @param {number} maxXp maximum attainable XP of the achievement
 * @param {number} progressFrac progress percentage in fraction. It is always between 0 to 1, both inclusive.
 * @param {AchievementStatus} status the achievement status
 * @param {Set<string>} children a set of immediate prerequisites uuid
 * @param {Set<string>} descendant a set of all descendant prerequisites uuid (including immediate prerequisites)
 */
class AchievementNode {
  public achievement: AchievementItem;
  public displayDeadline?: Date;
  public xp: number;
  public maxXp: number;
  public progressFrac: number;
  public status: AchievementStatus;
  public children: Set<string>;
  public descendant: Set<string>;

  constructor(achievement: AchievementItem) {
    const { deadline, prerequisiteUuids } = achievement;

    this.achievement = achievement;
    this.displayDeadline = deadline;
    this.xp = 0;
    this.maxXp = 0;
    this.progressFrac = 0;
    this.status = AchievementStatus.ACTIVE;
    this.children = new Set(prerequisiteUuids);
    this.descendant = new Set(prerequisiteUuids);
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
   * Returns an array of AchievementItem
   */
  public getAllAchievements() {
    return [...this.nodeList.values()].map(node => node.achievement);
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
   * Returns the AchievementItem
   *
   * @param uuid Achievement Uuid
   */
  public getAchievement(uuid: string) {
    return this.nodeList.get(uuid)!.achievement;
  }

  /**
   * Returns true if goal exists
   */
  public hasGoal(uuid: string) {
    return this.goalList.has(uuid);
  }

  /**
   * Returns the AchievementGoal
   *
   * @param uuid Goal Uuid
   */
  public getGoal(uuid: string) {
    return this.goalList.get(uuid)!;
  }

  /**
   * Returns the GoalDefinition
   *
   * @param uuid Goal Uuid
   */
  public getGoalDefinition(uuid: string) {
    return this.goalList.get(uuid)! as GoalDefinition;
  }

  /**
   * Returns the position of the achievement
   *
   * @param uuid Achievement Uuid
   */
  public getAchievementPositionByUuid(uuid: string) {
    return this.nodeList.get(uuid)!.achievement.position;
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
   * Inserts a new AchievementItem into the Inferencer,
   * then returns the newly assigned achievementUuid
   *
   * @param achievement the AchievementItem
   */
  public insertAchievement(achievement: AchievementItem) {
    // first, generate a new unique uuid
    const newUuid = v4();

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
   * Inserts a new GoalDefinition into the Inferencer,
   * then returns the newly assigned goalUuid
   *
   * @param definition the GoalDefinition
   */
  public insertGoalDefinition(definition: GoalDefinition) {
    // first, generate a new unique uuid by finding the max uuid
    const newUuid = v4();

    // then assign the new unique uuid by overwriting the goal item supplied by param
    // and insert it into goalList
    definition.uuid = newUuid;
    this.goalList.set(newUuid, { ...definition, ...defaultGoalProgress });

    // finally, process the goalList
    this.processGoals();

    return newUuid;
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
   * Returns an array of achievementUuid that isTask
   */
  public listTaskUuids() {
    return this.getAllAchievements()
      .filter(achievement => achievement.isTask)
      .map(task => task.uuid);
  }

  /**
   * Returns an array of achievementId that isTask sorted by position
   */
  public listSortedTaskUuids() {
    return this.getAllAchievements()
      .filter(achievement => achievement.isTask)
      .sort((taskA, taskB) => taskA.position - taskB.position)
      .map(sortedTask => sortedTask.uuid);
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
    return this.goalList.get(uuid)?.text;
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
    return this.nodeList.get(uuid)?.achievement.title;
  }

  /**
   * Returns XP earned from the achievement
   *
   * @param uuid Achievement Uuid
   */
  public getAchievementXp(uuid: string) {
    return this.nodeList.has(uuid) ? this.nodeList.get(uuid)!.xp : 0;
  }

  /**
   * Returns the maximum attainable XP from the achievement
   *
   * @param uuid Achievement Uuid
   */
  public getAchievementMaxXp(uuid: string) {
    return this.nodeList.has(uuid) ? this.nodeList.get(uuid)!.maxXp : 0;
  }

  /**
   * Returns total XP earned from all goals
   *
   * Note: Goals that do not belong to any achievement is also added into the total XP
   * calculation
   */
  public getTotalXp() {
    return this.getAllGoals().reduce((totalXp, goal) => totalXp + goal.xp, 0);
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

      this.generateDescendant(node);
      this.generateDisplayDeadline(node);
      this.generateXpAndMaxXp(node);
      this.generateProgressFrac(node);
      this.generateStatus(node);
    });
  }

  private processGoals() {
    this.textToUuid = new Map();

    this.goalList.forEach(goal => {
      const { text, uuid } = goal;
      this.textToUuid.set(text, uuid);
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
      nodeList.set(achievement.uuid, new AchievementNode(achievement))
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
    goals.forEach(goal => goalList.set(goal.uuid, goal));
    return goalList;
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
   * Calculates the achievement attained XP and maximum attainable XP
   *
   * @param node the AchievementNode
   */
  private generateXpAndMaxXp(node: AchievementNode) {
    const { goalUuids } = node.achievement;
    node.xp = goalUuids.reduce((xp, goalUuid) => xp + this.getGoal(goalUuid).xp, 0);
    node.maxXp = goalUuids.reduce((maxXp, goalUuid) => maxXp + this.getGoal(goalUuid).maxXp, 0);
  }

  /**
   * Calculates the achievement progress percentage between [0..1]
   *
   * @param node the AchievementNode
   */
  private generateProgressFrac(node: AchievementNode) {
    const { goalUuids } = node.achievement;
    const xp = goalUuids.reduce((xp, goalUuid) => xp + this.getGoal(goalUuid).xp, 0);

    node.progressFrac = node.maxXp === 0 ? 0 : Math.min(xp / node.maxXp, 1);
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
    const { goalUuids } = node.achievement;

    const achievementCompleted =
      goalUuids.length !== 0 &&
      goalUuids
        .map(goalUuid => this.getGoal(goalUuid).completed)
        .reduce((result, goalCompleted) => result && goalCompleted, true);

    const hasUnexpiredDeadline = !isExpired(node.displayDeadline);

    node.status = achievementCompleted
      ? AchievementStatus.COMPLETED
      : hasUnexpiredDeadline
      ? AchievementStatus.ACTIVE
      : AchievementStatus.EXPIRED;
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
