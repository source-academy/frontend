import { Reducer } from 'redux';

import { IAction, LOG_OUT, SAVE_CANVAS } from '../actions/actionTypes';
import { defaultAcademy, IAcademyState } from './states';

export const reducer: Reducer<IAcademyState> = (state = defaultAcademy, action: IAction) => {
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
