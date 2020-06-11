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
 * id: unique id, primary key of the achievement item
 * exp: exp that the achievement item grants
 *    (Note: UI displays the sum of exp and all prerequisite exp)
 * deadline: deadline of the achievement item
 *    (Note: UI displays the furthest deadline of all prerequisite)
 * isTask: the achievement item is rendered as an achievement task if true
 * prerequisites: an array of the prerequisites id
 * completionGoal: achievement is marked as complete if
 *    user's completionProgress >= completionGoal
 */
export type AchievementItem = {
  id: number;
  title: string;
  ability: AchievementAbility;
  exp?: number;
  deadline?: Date;
  isTask: boolean;
  prerequisites?: number[];
  status: AchievementStatus;
  completionGoal: number;
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
