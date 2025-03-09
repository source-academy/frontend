import { createActions } from 'src/commons/redux/utils';

import { ContestLeaderboardRow, LeaderboardRow } from './LeaderboardTypes';

const LeaderboardActions = createActions('leaderboard', {
  getAllUsersXp: () => ({}),
  saveAllUsersXp: (userXp: LeaderboardRow[]) => userXp,
  getAllContestScores: (assessmentId: number) => assessmentId,
  saveAllContestScores: (contestScore: ContestLeaderboardRow[]) => contestScore,
  getAllContestPopularVotes: (assessmentId: number) => assessmentId,
  saveAllContestPopularVotes: (contestPopularVote: ContestLeaderboardRow[]) => contestPopularVote,
  getCode: () => ({}),
  saveCode: (code: string) => code,
  clearCode: () => ({})
});

export default LeaderboardActions;
