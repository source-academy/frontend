import { Reducer } from 'redux';

import { SourceActionType } from 'src/utils/actionsHelper';
import { UPDATE_GROUP_OVERVIEWS } from 'src/commons/application/types/ActionTypes';
import { defaultDashBoard, IDashBoardState } from 'src/commons/application/ApplicationTypes';

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
