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
 * Information of an achievement item
 *
 * @param {number} id unique id, primary key of the achievement item
 * @param {number} exp amount of exp that the achievement item grants
 *    (Note: UI displays the sum of exp and all prerequisite exp)
 * @param {Date} deadline the deadline of the achievement item
 *    (Note: UI displays the furthest deadline of all prerequisite)
 * @param {boolean} isTask the achievement item is rendered as an achievement task if true
 * @param {number[]} prerequisites an array of the prerequisites id
 * @param {number} completionGoal achievement is marked as complete if
 *    user's completionProgress >= completionGoal
 */
export type AchievementItem = {
  id: number;
  title: string;
  ability: AchievementAbility;
  exp?: number;
  deadline?: Date;
  isTask: boolean;
  prerequisiteIDs?: number[];
  status: AchievementStatus;
  completionGoal: number;
};

/**
 * Information of an achievement in a modal
 *
 * @param {number} id unique id, primary key of the modal
 * @param {string} modalImageUrl URL of the modal image
 * @param {string} description fixed text that displays under title
 * @param {string} goal describes the achievement requirement
 * @param {string} completionText text that displays after student completes the achievement
 */
export type AchievementModalItem = {
  id: number;
  title: string;
  modalImageUrl: string;
  description: string;
  exp: number;
  goal: string;
  completionText: string;
};
