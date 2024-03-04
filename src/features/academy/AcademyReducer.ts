import { Reducer } from 'redux';

import { defaultAcademy } from '../../commons/application/ApplicationTypes';
import { LOG_OUT } from '../../commons/application/types/CommonsTypes';
import { SourceActionType } from '../../commons/utils/ActionsHelper';
import { AcademyState } from './AcademyTypes';

export const AcademyReducer: Reducer<AcademyState> = (
  state = defaultAcademy,
  action: SourceActionType
) => {
  switch (action.type) {
    case LOG_OUT:
      return defaultAcademy;
    default:
      return state;
  }
};
