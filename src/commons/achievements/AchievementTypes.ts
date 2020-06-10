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
