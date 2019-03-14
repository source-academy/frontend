import { Reducer } from 'redux';

import { CHANGE_QUERY_STRING, IAction } from '../actions/actionTypes';
import { defaultPlayground, IPlaygroundState } from './states';

export const reducer: Reducer<IPlaygroundState> = (state = defaultPlayground, action: IAction) => {
  switch (action.type) {
    case CHANGE_QUERY_STRING:
      return {
        ...state,
        queryString: action.payload
      };
    default:
      return state;
  }
};
