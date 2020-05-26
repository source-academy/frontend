export type GroupOverview = {
  id: number;
  groupName: string;
  avengerName: string;
};

export type LeaderBoardInfo = {
  avengerName: string;
  numOfUngradedMissions: number;
  totalNumOfMissions: number;
  numOfUngradedQuests: number;
  totalNumOfQuests: number;
};

export type DashBoardState = {
  readonly groupOverviews: GroupOverview[];
};