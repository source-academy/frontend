import { action } from 'typesafe-actions';

import {
  FETCH_GROUP_GRADING_SUMMARY,
  GradingSummary,
  UPDATE_GROUP_GRADING_SUMMARY
} from './DashboardTypes';

export const fetchGroupGradingSummary = () => action(FETCH_GROUP_GRADING_SUMMARY);

export const updateGroupGradingSummary = (gradingSummary: GradingSummary) =>
  action(UPDATE_GROUP_GRADING_SUMMARY, gradingSummary);
