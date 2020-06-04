export const FETCH_GROUP_OVERVIEWS = 'FETCH_GROUP_OVERVIEWS';
export const UPDATE_GROUP_OVERVIEWS = 'UPDATE_GROUP_OVERVIEWS';

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
