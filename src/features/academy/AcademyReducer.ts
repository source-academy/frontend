import { Reducer } from 'redux';

import { SourceActionType } from 'src/utils/actionsHelper';
import { LOG_OUT, SAVE_CANVAS } from 'src/commons/application/types/ActionTypes';
import { defaultAcademy, IAcademyState } from 'src/commons/application/ApplicationTypes';

export const AcademyReducer: Reducer<IAcademyState> = (
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
