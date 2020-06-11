// TODO: Rename abilities
export enum AchievementAbility {
  ACADEMIC = 'Academic',
  COMMUNITY = 'Community',
  EFFORT = 'Effort',
  EXPLORATION = 'Exploration'
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
 * Information of a main achievement item
 *
 * title: unique string, used to identify the achievement
 * details: more information of the achievement
 * subAchievementTitles: array of sub achievement titles
 * status: student's achievement status
 */
export type AchievementItem = {
  title: string;
  details: AchievementDetails;
  subAchievementTitles: string[];
  status: AchievementStatus;
};

/**
 * More information of a main achievement
 *
 * ability: ability group of the achievement
 * exp: amount of exp the achievement grants, optional
 *  (UI displays the sum of main & sub achievements exp)
 * deadline: deadline of the achievement, optional
 *  (UI displays the furthest deadline of all main & sub achievement deadlines)
 */
export type AchievementDetails = {
  ability: AchievementAbility;
  exp?: number;
  deadline?: Date;
};

/**
 * Information of a sub achievement item
 *
 * title: unique string, used to identify the sub achievement
 * exp: amount of exp the subachivement grants
 *   (UI displays the sub achievement exp)
 * deadline: deadline of the sub achievement
 *   (UI displays the deadline of the sub achievement)
 */
export type SubAchievementItem = {
  title: string;
  exp: number;
  deadline?: Date;
  status: AchievementStatus;
};

/**
 * Information of an achievement in a modal
 *
 * title: unique string, used to identify the achievement / sub achievement
 * modalImageUrl: URL of the image to show on the modal
 * description: expectations to hit the particular achievement.
 */
export type AchievementModalItem = {
  title: string;
  modalImageUrl: string;
  description: string;
};
