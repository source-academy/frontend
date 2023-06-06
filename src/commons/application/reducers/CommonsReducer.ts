import { Reducer } from 'redux';
import { SourceActionType } from 'src/commons/utils/ActionsHelper';

import { defaultRouter } from '../ApplicationTypes';
import { RouterState, UPDATE_REACT_ROUTER } from '../types/CommonsTypes';

export const RouterReducer: Reducer<RouterState> = (
  state = defaultRouter,
  action: SourceActionType
) => {
  switch (action.type) {
    case UPDATE_REACT_ROUTER:
      return action.payload;
    default:
      return state;
  }
};
