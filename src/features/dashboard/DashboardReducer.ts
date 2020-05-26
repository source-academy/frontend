import { Reducer } from 'redux';

import { SourceActionType } from 'src/utils/actionsHelper';
import { UPDATE_GROUP_OVERVIEWS } from 'src/commons/types/ActionTypes';
import { defaultDashBoard, IDashBoardState } from 'src/commons/states/ApplicationStates';

export const DashboardReducer: Reducer<IDashBoardState> = (
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
