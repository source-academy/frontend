import { Reducer } from 'redux';
import { defaultRouter } from 'src/commons/application/ApplicationTypes';
import { RouterState, UPDATE_REACT_ROUTER } from 'src/commons/application/types/CommonsTypes';
import { SourceActionType } from 'src/commons/utils/ActionsHelper';

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
