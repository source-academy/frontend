import { createReducer, type Reducer } from '@reduxjs/toolkit';

import { defaultDashboard } from '../../commons/application/ApplicationTypes';
import type { SourceActionType } from '../../commons/utils/ActionsHelper';
import { updateGroupGradingSummary } from './DashboardActions';
import type { DashboardState } from './DashboardTypes';

export const DashboardReducer: Reducer<DashboardState, SourceActionType> = createReducer(
  defaultDashboard,
  builder => {
    builder.addCase(updateGroupGradingSummary, (state, action) => {
      state.gradingSummary = action.payload;
    });
  },
);
