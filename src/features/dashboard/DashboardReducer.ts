import { Reducer } from 'redux';

import { defaultDashBoard, IDashBoardState } from '../../commons/application/ApplicationTypes';
import { UPDATE_GROUP_OVERVIEWS } from '../../commons/application/types/ActionTypes';
import { SourceActionType } from '../../utils/actionsHelper';

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
