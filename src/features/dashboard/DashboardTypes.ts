export const FETCH_GROUP_GRADING_SUMMARY = 'FETCH_GROUP_GRADING_SUMMARY';
export const UPDATE_GROUP_GRADING_SUMMARY = 'UPDATE_GROUP_GRADING_SUMMARY';

export type DashboardState = {
  gradingSummary: GradingSummary;
};

export type GradingSummaryEntry = {
  groupName: string;
  leaderName: string;
  ungradedMissions: number;
  submittedMissions: number;
  ungradedSidequests: number;
  submittedSidequests: number;
};

export type GradingSummary = GradingSummaryEntry[];
