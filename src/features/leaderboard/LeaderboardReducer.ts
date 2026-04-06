import { createReducer, Reducer } from '@reduxjs/toolkit';
import { SourceActionType } from 'src/commons/utils/ActionsHelper';

import { defaultLeaderboard } from '../../commons/application/ApplicationTypes';
import LeaderboardActions from './LeaderboardActions';
import { LeaderboardState } from './LeaderboardTypes';

export const LeaderboardReducer: Reducer<LeaderboardState, SourceActionType> = createReducer(
  defaultLeaderboard,
  builder => {
    builder
      .addCase(LeaderboardActions.saveOverallLeaderboardXP, (state, action) => {
        state.paginatedUserXp = {
          rows: action.payload.rows || [],
          userCount: action.payload.userCount || 0
        };
      })
      .addCase(LeaderboardActions.saveAllContestScores, (state, action) => {
        state.contestScore = action.payload;
      })
      .addCase(LeaderboardActions.saveAllContestPopularVotes, (state, action) => {
        state.contestPopularVote = action.payload;
      })
      .addCase(LeaderboardActions.saveCode, (state, action) => {
        state.code = action.payload;
      })
      .addCase(LeaderboardActions.clearCode, (state, action) => {
        state.code = '';
      })
      .addCase(LeaderboardActions.saveContests, (state, action) => {
        state.contests = action.payload;
      })
      .addCase(LeaderboardActions.setWorkspaceInitialRun, (state, action) => {
        state.initialRun[action.payload] = true;
      })
      .addCase(LeaderboardActions.resetWorkspaceInitialRun, (state, action) => {
        state.initialRun[action.payload] = false;
      });
  }
);
