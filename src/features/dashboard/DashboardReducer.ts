import { Reducer } from 'redux';
import { ActionType } from 'typesafe-actions';

import { actions } from 'src/utils/actionsHelper';
import { UPDATE_GROUP_OVERVIEWS } from 'src/commons/types/ActionTypes';
import { defaultDashBoard, IDashBoardState } from 'src/commons/states/ApplicationStates';

export const DashboardReducer: Reducer<IDashBoardState> = (
  state = defaultDashBoard,
  action: ActionType<typeof actions>
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
