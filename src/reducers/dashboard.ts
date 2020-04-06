import { Reducer } from 'redux';
import { ActionType } from 'typesafe-actions';

import * as actions from '../actions';
import { UPDATE_GROUPS_INFO } from '../actions/actionTypes';
import { defaultDashBoard, IDashBoardState } from './states';

export const reducer: Reducer<IDashBoardState> = (
  state = defaultDashBoard,
  action: ActionType<typeof actions>
) => {
  switch (action.type) {
    case UPDATE_GROUPS_INFO:
      return {
        ...state,
        groupsInfo: action.payload
      };
    default:
      return state;
  }
};
