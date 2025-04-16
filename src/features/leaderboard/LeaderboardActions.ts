import { createActions } from 'src/commons/redux/utils';

import { ContestLeaderboardRow, LeaderboardContestDetails, LeaderboardRow } from './LeaderboardTypes';

const LeaderboardActions = createActions('leaderboard', {
  getAllUsersXp: 0,
  saveAllUsersXp: (userXp: LeaderboardRow[]) => userXp,
  getAllContestScores: (assessmentId: number) => assessmentId,
  saveAllContestScores: (contestScore: ContestLeaderboardRow[]) => contestScore,
  getAllContestPopularVotes: (assessmentId: number) => assessmentId,
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
