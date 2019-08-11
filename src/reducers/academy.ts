import { Reducer } from 'redux';
import { ActionType } from 'typesafe-actions';

import * as actions from '../actions';
import { LOG_OUT, SAVE_CANVAS } from '../actions/actionTypes';
import { defaultAcademy, IAcademyState } from './states';

export const reducer: Reducer<IAcademyState> = (
  state = defaultAcademy,
  action: ActionType<typeof actions>
) => {
  switch (action.type) {
    case LOG_OUT:
      return defaultAcademy;
    case SAVE_CANVAS:
      return {
        ...state,
        gameCanvas: action.payload
      };
    default:
      return state;
  }
};
