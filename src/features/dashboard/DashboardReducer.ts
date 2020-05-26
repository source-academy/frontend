import { Reducer } from 'redux';

import { defaultDashBoard, IDashBoardState } from 'src/commons/application/ApplicationTypes';
import { UPDATE_GROUP_OVERVIEWS } from 'src/commons/application/types/ActionTypes';
import { SourceActionType } from 'src/utils/actionsHelper';

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
