import { createSlice,PayloadAction } from "@reduxjs/toolkit";
import { GradingSummary } from "src/features/dashboard/DashboardTypes";

import { defaultDashboard } from "./AllTypes";

export const { actions: dashboardActions, reducer: dashboardReducer } = createSlice({
  name: 'dashboard',
  initialState: defaultDashboard,
  reducers: {
    updateGroupGradingSummary(state, { payload }: PayloadAction<GradingSummary>) {
      state.gradingSummary = payload
    }
  }
})
