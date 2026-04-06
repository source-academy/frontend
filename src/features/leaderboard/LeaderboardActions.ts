import { createActions } from 'src/commons/redux/utils';

import {
  ContestLeaderboardRow,
  LeaderboardContestDetails,
  LeaderboardRow
} from './LeaderboardTypes';

const LeaderboardActions = createActions('leaderboard', {
  getOverallLeaderboardXP: (page: number, pageSize: number) => ({ page, pageSize }),
  saveOverallLeaderboardXP: (payload: { rows: LeaderboardRow[]; userCount: number }) => payload,
  getAllContestScores: (assessmentId: number, visibleEntries: number) => ({
    assessmentId,
    visibleEntries
  }),
  saveAllContestScores: (contestScore: ContestLeaderboardRow[]) => contestScore,
  getAllContestPopularVotes: (assessmentId: number, visibleEntries: number) => ({
    assessmentId,
    visibleEntries
  }),
  saveAllContestPopularVotes: (contestPopularVote: ContestLeaderboardRow[]) => contestPopularVote,
  getCode: 0,
  saveCode: (code: string) => code,
  clearCode: 0,
  getContests: 0,
  saveContests: (contests: LeaderboardContestDetails[]) => contests,
  setWorkspaceInitialRun: (contestID: number) => contestID,
  resetWorkspaceInitialRun: (contestID: number) => contestID
});

export default LeaderboardActions;
