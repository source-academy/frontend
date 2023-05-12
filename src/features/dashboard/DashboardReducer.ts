import { Reducer } from 'redux';
import { defaultDashboard } from 'src/commons/application/ApplicationTypes';
import { SourceActionType } from 'src/commons/utils/ActionsHelper';

import { DashboardState, UPDATE_GROUP_GRADING_SUMMARY } from './DashboardTypes';

export const DashboardReducer: Reducer<DashboardState> = (
  state = defaultDashboard,
  action: SourceActionType
) => {
  switch (action.type) {
    case UPDATE_GROUP_GRADING_SUMMARY:
      return {
        ...state,
        gradingSummary: action.payload
      };
    default:
      return state;
  }
};
