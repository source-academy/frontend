import { Reducer } from 'redux';

import { CHANGE_QUERY_STRING, IAction, TOGGLE_USING_SUBST } from '../actions/actionTypes';
import { defaultPlayground, IPlaygroundState } from './states';

export const reducer: Reducer<IPlaygroundState> = (
  state: IPlaygroundState = defaultPlayground,
  action: IAction
) => {
  switch (action.type) {
    case CHANGE_QUERY_STRING:
      return {
        ...state,
        queryString: action.payload
      };
    case TOGGLE_USING_SUBST:
      return {
        ...state,
        usingSubst: action.payload
      };
    default:
      return state;
  }
};
