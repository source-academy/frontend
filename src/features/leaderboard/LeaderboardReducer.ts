import { createReducer, Reducer } from '@reduxjs/toolkit';
import { SourceActionType } from 'src/commons/utils/ActionsHelper';

import { defaultLeaderboard } from '../../commons/application/ApplicationTypes';
import LeaderboardActions from './LeaderboardActions';
import { LeaderboardState } from './LeaderboardTypes';

export const LeaderboardReducer: Reducer<LeaderboardState, SourceActionType> = createReducer(
  defaultLeaderboard,
  builder => {
    builder
      .addCase(LeaderboardActions.saveAllUsersXp, (state, action) => {
        state.userXp = action.payload;
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
      });
  }
);
