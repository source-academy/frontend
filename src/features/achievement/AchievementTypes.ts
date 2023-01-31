import { AssessmentOverview } from 'src/commons/assessment/AssessmentTypes';

import { BooleanExpression } from './ExpressionTypes';

export const ADD_EVENT = 'ADD_EVENT';
export const BULK_UPDATE_ACHIEVEMENTS = 'BULK_UPDATE_ACHIEVEMENTS';
export const BULK_UPDATE_GOALS = 'BULK_UPDATE_GOALS';
export const EDIT_ACHIEVEMENT = 'EDIT_ACHIEVEMENT';
export const EDIT_GOAL = 'EDIT_GOAL';
export const HANDLE_EVENT = 'HANDLE_EVENT';
export const GET_ACHIEVEMENTS = 'GET_ACHIEVEMENTS';
export const GET_GOALS = 'GET_GOALS';
export const GET_OWN_GOALS = 'GET_OWN_GOALS';
export const GET_USER_ASSESSMENT_OVERVIEWS = 'GET_USER_ASSESSMENT_OVERVIEWS';
export const GET_USERS = 'GET_USERS';
export const REMOVE_ACHIEVEMENT = 'REMOVE_ACHIEVEMENT';
export const REMOVE_GOAL = 'REMOVE_GOAL';
export const SAVE_ACHIEVEMENTS = 'SAVE_ACHIEVEMENTS';
export const SAVE_GOALS = 'SAVE_GOALS';
export const SAVE_USER_ASSESSMENT_OVERVIEWS = 'SAVE_USER_ASSESSMENT_OVERVIEWS';
export const SAVE_USERS = 'SAVE_USERS';
export const UPDATE_GOAL_PROGRESS = 'UPDATE_GOAL_PROGRESS';
export const UPDATE_OWN_GOAL_PROGRESS = 'UPDATE_OWN_GOAL_PROGRESS';

export enum AchievementStatus {
  ACTIVE = 'ACTIVE', // deadline not over and not completed
  COMPLETED = 'COMPLETED', // completed, regardless of deadline
  EXPIRED = 'EXPIRED', // deadline over and not completed
  UNRELEASED = 'UNRELEASED' // release date not reached yet
}

export enum FilterStatus {
  ALL = 'ALL', // show all achievements
  ACTIVE = 'ACTIVE', // show active achievements only
  COMPLETED = 'COMPLETED' // show completed achievements only
}

/**
 * Information of an achievement item
 *
 * @param {string} uuid unique uuid of the achievement item
 * @param {string} title title of the achievement
 * @param {number} xp the xp gained when completing the achievement
 * @param {boolean} isVariableXp the xp gained from the achievement is the sum of its goal counts
 * @param {Date} deadline Optional, the deadline of the achievement
 * @param {Date} release Optional, the release date of the achievement
 * @param {boolean} isTask if true, the achievement is rendered as an achievement task
 * @param {number} position ordering of the achievement task, 0 for non-task
 * @param {string[]} prerequisiteUuids an array of prerequisite uuids
 * @param {string[]} goalUuids an array of goal uuids
 * @param {string} cardBackground background image URL of the achievement card
 * @param {AchievementView} view the achievement view
 */
export type AchievementItem = {
  uuid: string;
  title: string;
  xp: number;
  isVariableXp: boolean;
  deadline?: Date;
  release?: Date;
  isTask: boolean;
  position: number;
  prerequisiteUuids: string[];
  goalUuids: string[];
  cardBackground: string;
  view: AchievementView;
};

export type AchievementGoal = GoalDefinition & GoalProgress;

/**
 * Information of an achievement goal definition
 *
 * @param {string} uuid unique uuid of the goal
 * @param {string} text goal description
 * @param {string[]} achievementUuids an array of achievement uuids that use this goal
 * @param {GoalMeta} meta contains meta data relevant to the goal type
 */
export type GoalDefinition = {
  uuid: string;
  text: string;
  achievementUuids: string[];
  meta: GoalMeta;
};

/**
 * Information of an achievement goal progress
 *
 * @param {string} uuid unique uuid of the goal
 * @param {number} xp student's current XP of the goal
 * @param {number} maxXp maximum attainable XP of the goal (computed by server)
 * @param {boolean} completed student's completion status of the goal
 */
export type GoalProgress = {
  uuid: string;
  count: number;
  targetCount: number;
  completed: boolean;
};

export const defaultGoalProgress = {
  count: 0,
  targetCount: 1,
  completed: false
};

export enum GoalType {
  MANUAL = 'Manual',
  EVENT = 'Event',
  ASSESSMENT = 'Assessment (unsupported)',
  BINARY = 'Binary (unsupported)'
}

export enum EventType {
  NONE = 'None', // This is just for the purposes of a default value
  RUN_CODE = 'Run Code',
  ERROR = 'Error',
  RUN_TESTCASE = 'Run Testcase'
}

export type GoalMeta = AssessmentMeta | BinaryMeta | ManualMeta | EventMeta;

export type AssessmentMeta = {
  type: GoalType.ASSESSMENT;
  assessmentNumber: number;
  requiredCompletionFrac: number; // between [0..1]
};

export type BinaryMeta = {
  type: GoalType.BINARY;
  condition: BooleanExpression;
  targetCount: number;
};

export type ManualMeta = {
  type: GoalType.MANUAL;
  targetCount: number;
};

export type EventMeta = {
  type: GoalType.EVENT;
  eventNames: EventType[];
  targetCount: number;
  release?: Date;
  deadline?: Date;
  observeFrom?: Date;
  observeTo?: Date;
};

/**
 * Information of an achievement view
 *
 * @param {string} coverImage cover image URL
 * @param {string} description fixed text that displays under title
 * @param {string} completionText text that displays after student completes the achievement
 */
export type AchievementView = {
  coverImage: string;
  description: string;
  completionText: string;
};

export type AchievementUser = {
  name?: string;
  username: string;
  courseRegId: number;
  group: string;
};

export type AchievementState = {
  achievements: AchievementItem[];
  goals: AchievementGoal[];
  users: AchievementUser[];
  assessmentOverviews: AssessmentOverview[];
};
