export enum AchievementStatus {
  ACTIVE = 'ACTIVE',       // deadline not over and not completed
  COMPLETED = 'COMPLETED', // completed, regardless of deadline
  EXPIRED = 'EXPIRED'      // deadline over and not completed
}

export enum AchievementAbility {
  ACADEMIC = 'Academic',
  COMMUNITY = 'Community',
  EFFORT = 'Effort',
  EXPLORATION = 'Exploration'
}

export type AchievementOverview = {
  title: string;
  subachievementTitles: string[];
  status: AchievementStatus;
  ability: AchievementAbility;
  exp: number;
  deadline: Date | undefined;
};

export type SubAchivementOverview = {
  title: string;
  exp: number;
  deadline: Date | undefined;
};

export type AchievementModalOverview = {
  title: string;
  modalImageUrl: string;
  description: string;
};
