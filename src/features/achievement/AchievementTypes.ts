import { BooleanExpression } from './ExpressionTypes';

export const BULK_UPDATE_ACHIEVEMENTS = 'BULK_UPDATE_ACHIEVEMENTS';
export const BULK_UPDATE_GOALS = 'BULK_UPDATE_GOALS';
export const EDIT_ACHIEVEMENT = 'EDIT_ACHIEVEMENT';
export const EDIT_GOAL = 'EDIT_GOAL';
export const GET_ACHIEVEMENTS = 'GET_ACHIEVEMENTS';
export const GET_GOALS = 'GET_GOALS';
export const GET_OWN_GOALS = 'GET_OWN_GOALS';
export const REMOVE_ACHIEVEMENT = 'REMOVE_ACHIEVEMENT';
export const REMOVE_GOAL = 'REMOVE_GOAL';
export const SAVE_ACHIEVEMENTS = 'SAVE_ACHIEVEMENTS';
export const SAVE_GOALS = 'SAVE_GOALS';
export const UPDATE_GOAL_PROGRESS = 'UPDATE_GOAL_PROGRESS';

export enum AchievementAbility {
  CORE = 'Core',
  EFFORT = 'Effort',
  EXPLORATION = 'Exploration',
  COMMUNITY = 'Community',
  FLEX = 'Flex'
}

export enum AchievementStatus {
  ACTIVE = 'ACTIVE', // deadline not over and not completed
  COMPLETED = 'COMPLETED', // completed, regardless of deadline
  EXPIRED = 'EXPIRED' // deadline over and not completed
}

export enum FilterStatus {
  ALL = 'ALL', // show all achievements
  ACTIVE = 'ACTIVE', // show active achievements only
  COMPLETED = 'COMPLETED' // show completed achievements only
}

/**
 * Information of an achievement item
 *
 * @param {number} id unique id of the achievement item
 * @param {string} title title of the achievement
 * @param {AchievementAbility} ability ability of the achievement, string enum
 * @param {Date} deadline Optional, the deadline of the achievement
 * @param {Date} release Optional, the release date of the achievement
 * @param {boolean} isTask if true, the achievement is rendered as an achievement task
 * @param {number} position ordering of the achievement task, 0 for non-task
 * @param {number[]} prerequisiteIds an array of prerequisite ids
 * @param {number[]} goalIds an array of goal ids
 * @param {string} cardTileUrl background image URL of the achievement card
 * @param {AchievementView} view the achievement view
 */
export type AchievementItem = {
  id: number;
  title: string;
  ability: AchievementAbility;
  deadline?: Date;
  release?: Date;
  isTask: boolean;
  position: number;
  prerequisiteIds: number[];
  goalIds: number[];
  cardTileUrl: string;
  view: AchievementView;
};

export type AchievementGoal = GoalDefinition & GoalProgress;

/**
 * Information of an achievement goal definition
 *
 * @param {number} id unique id of the goal
 * @param {string} text goal description
 * @param {GoalMeta} meta contains meta data relevant to the goal type
 */
export type GoalDefinition = {
  id: number;
  text: string;
  meta: GoalMeta;
};

/**
 * Information of an achievement goal progress
 *
 * @param {number} id unique id of the goal
 * @param {number} xp student's current XP of the goal
 * @param {number} maxXp maximum attainable XP of the goal (computed by server)
 * @param {boolean} completed student's completion status of the goal
 */
export type GoalProgress = {
  id: number;
  xp: number;
  maxXp: number;
  completed: boolean;
};

export const defaultGoalProgress = {
  xp: 0,
  maxXp: 0,
  completed: false
};

export enum GoalType {
  ASSESSMENT = 'Assessment',
  BINARY = 'Binary',
  MANUAL = 'Manual'
}

export type GoalMeta = AssessmentMeta | BinaryMeta | ManualMeta;

export type AssessmentMeta = {
  type: GoalType.ASSESSMENT;
  assessmentNumber: string; // e.g. 'M1A', 'P2'
  requiredCompletionFrac: number; // between [0..1]
};

export type BinaryMeta = {
  type: GoalType.BINARY;
  condition: BooleanExpression;
  maxXp: number;
};

export type ManualMeta = {
  type: GoalType.MANUAL;
  maxXp: number;
};

/**
 * Information of an achievement view
 *
 * @param {string} canvasUrl canvas image URL
 * @param {string} description fixed text that displays under title
 * @param {string} completionText text that displays after student completes the achievement
 */
export type AchievementView = {
  canvasUrl: string;
  description: string;
  completionText: string;
};

export type AchievementState = {
  achievements: AchievementItem[];
  goals: AchievementGoal[];
};
