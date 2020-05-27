import { Reducer } from 'redux';

import { defaultDashBoard } from 'src/commons/application/ApplicationTypes';
import { SourceActionType } from 'src/utils/actionsHelper';

import { DashBoardState, UPDATE_GROUP_OVERVIEWS } from './DashboardTypes';

export const DashboardReducer: Reducer<DashBoardState> = (
  state = defaultDashBoard,
  action: SourceActionType
) => {
  switch (action.type) {
    case UPDATE_GROUP_OVERVIEWS:
      return {
        ...state,
        groupOverviews: action.payload
      };
    default:
      return state;
  }
};
