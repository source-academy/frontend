import { Reducer } from 'redux';

import { AcademyState, defaultAcademy } from 'src/commons/application/ApplicationTypes';
import { LOG_OUT, SAVE_CANVAS } from 'src/commons/application/types/ActionTypes';
import { SourceActionType } from 'src/utils/actionsHelper';

export const AcademyReducer: Reducer<AcademyState> = (
  state = defaultAcademy,
  action: SourceActionType
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
