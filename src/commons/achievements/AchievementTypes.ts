export enum AchievementStatus {
  PENDING = 'ALL',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
}

export enum AchievementPath {
  ACADEMIC = 'Academic',
  EXPLORATION = 'Exploration'
}

export type AchievementOverview = {
  title: string;
  subachievementTitles: string[];
  status: AchievementStatus;
  path: AchievementPath;
  exp: number;
  deadline: Date | undefined;
};

export type SubAchivementOverview = {
  title: string;
};

export type AchievementModalOverview = {
  title: string;
  modalImageUrl: string;
  description: string;
};
