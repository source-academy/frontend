import { Reducer } from 'redux';
import { ActionType } from 'typesafe-actions';

import * as actions from 'src/utils/actionsHelper';
import { LOG_OUT, SAVE_CANVAS } from 'src/commons/types/ActionTypes';
import { defaultAcademy, IAcademyState } from 'src/commons/states/ApplicationStates';

export const AcademyReducer: Reducer<IAcademyState> = (
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
