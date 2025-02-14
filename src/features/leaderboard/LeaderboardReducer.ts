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
      });
  }
);
