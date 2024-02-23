import { createAction } from '@reduxjs/toolkit';

import {
  FETCH_GROUP_GRADING_SUMMARY,
  GradingSummary,
  UPDATE_GROUP_GRADING_SUMMARY
} from './DashboardTypes';

export const fetchGroupGradingSummary = createAction(FETCH_GROUP_GRADING_SUMMARY, () => ({
  payload: {}
}));

export const updateGroupGradingSummary = createAction(
  UPDATE_GROUP_GRADING_SUMMARY,
  (gradingSummary: GradingSummary) => ({ payload: gradingSummary })
);
