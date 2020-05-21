export interface IGroupOverview {
  id: number;
  groupName: string;
  avengerName: string;
}

export type LeaderBoardInfo = {
  avengerName: string;
  numOfUngradedMissions: number;
  totalNumOfMissions: number;
  numOfUngradedQuests: number;
  totalNumOfQuests: number;
};