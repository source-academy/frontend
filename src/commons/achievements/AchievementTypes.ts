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
