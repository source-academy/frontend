export enum AchievementStatus {
  PENDING = 'ALL',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
}

export type AchievementOverview = {
  title: string;
  subachievementTitles: string[];
  status: AchievementStatus;
};

export type SubAchivementOverview = {
  title: string;
};

export type AchievementModalOverview = {
  title: string;
  modalImageUrl: string;
  description: string;
};
