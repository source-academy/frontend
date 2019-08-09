import { Reducer } from 'redux';
import { ActionType } from 'typesafe-actions';

import * as actions from '../actions';
import { CHANGE_QUERY_STRING } from '../actions/actionTypes';
import { defaultPlayground, IPlaygroundState } from './states';

export const reducer: Reducer<IPlaygroundState> = (
  state = defaultPlayground,
  action: ActionType<typeof actions>
) => {
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
