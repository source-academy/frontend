export const SAVE_ACHIEVEMENTS = 'SAVE_ACHIEVEMENTS';
export const GET_ACHIEVEMENTS = 'GET_ACHIEVEMENTS';
export const EDIT_ACHIEVEMENT = 'EDIT_ACHIEVEMENT';
export const REMOVE_ACHIEVEMENT = 'REMOVE_ACHIEVEMENT';

export const REMOVE_GOAL = 'REMOVE_GOAL';

export const SAVE_GOALS = 'SAVE_GOALS';
export const GET_GOALS = 'GET_GOALS';
export const EDIT_GOAL = 'EDIT_GOAL';

export enum AchievementAbility {
  CORE = 'Core',
  EFFORT = 'Effort',
  EXPLORATION = 'Exploration',
  COMMUNITY = 'Community',
  FLEX = 'Flex'
}

// TODO: use Object.values instead
export const achievementAbilities = [
  AchievementAbility.CORE,
  AchievementAbility.EFFORT,
  AchievementAbility.EXPLORATION,
  AchievementAbility.COMMUNITY,
  AchievementAbility.FLEX
];

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
 * @param {number} id unique id, primary key of the achievement item
 * @param {string} title title of the achievement
 * @param {AchievementAbility} ability ability of the achievement, string enum
 * @param {string} cardTileUrl background image of the achievement card
 * @param {Date} deadline Optional, the deadline of the achievement
 * @param {Date} release Optional, the release date of the achievement
 * @param {boolean} isTask if true, the achievement is rendered as an achievement task
 * @param {number} position ordering of the achievement task, 0 for non-task
 * @param {number[]} prerequisiteIds an array of prerequisite ids
 * @param {number[]} goalIds an array of goal ids
 * @param {AchievementViewItem} view the achievement view item
 */
export type AchievementItem = {
  id: number;
  title: string;
  ability: AchievementAbility;
  cardTileUrl: string;
  deadline?: Date;
  release?: Date;
  isTask: boolean;
  position: number;
  prerequisiteIds: number[];
  goalIds: number[];
  view: AchievementViewItem;
};

export type AchievementGoal = GoalDefinition & GoalProgress;

/**
 * Information of an achievement goal definition
 * NOTE: Achievement EXP named to deconflict with Assessment XP
 *
 * @param {number} id unique id of the goal
 * @param {string} text goal description
 * @param {number} maxExp maximum attainable exp of the goal
 * @param {GoalType} type type of goal, string enum
 * @param {GoalMeta} meta contains meta data relevant to the goal type
 */
export type GoalDefinition = {
  id: number;
  text: string;
  maxExp: number;
  type: GoalType;
  meta: GoalMeta;
};

/**
 * Information of an achievement goal progress
 * NOTE: Achievement EXP named to deconflict with Assessment XP
 *
 * @param {number} id unique id of the goal
 * @param {number} exp student's current exp of the goal
 * @param {boolean} completed student's completion status of the goal
 */
export type GoalProgress = {
  id: number;
  exp: number;
  completed: boolean;
};

export enum GoalType {
  ASSESSMENT = 'Assessment',
  BINARY = 'Binary',
  MANUAL = 'Manual'
}

export type GoalMeta = AssessmentMeta | BinaryMeta | ManualMeta;

export type AssessmentMeta = {
  assessmentId: number;
  requiredCompletionExp: number;
};

export type BinaryMeta = {
  condition: string;
};

export type ManualMeta = {
  // currently nothing
};

/**
 * Information of an achievement in a view
 *
 * @param {string} canvasUrl URL of the view image
 * @param {string} description fixed text that displays under title
 * @param {string} completionText text that displays after student completes the achievement
 */
export type AchievementViewItem = {
  canvasUrl: string;
  description: string;
  completionText: string;
};

export type AchievementState = {
  achievements: AchievementItem[];
  goals: AchievementGoal[];
};
