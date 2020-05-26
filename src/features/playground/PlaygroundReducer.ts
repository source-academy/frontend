import { Reducer } from 'redux';

import { SourceActionType } from 'src/utils/actionsHelper';
import { CHANGE_QUERY_STRING, TOGGLE_USING_SUBST, UPDATE_SHORT_URL } from 'src/commons/types/ActionTypes';
import { defaultPlayground, IPlaygroundState } from 'src/commons/states/ApplicationStates';

export const PlaygroundReducer: Reducer<IPlaygroundState> = (
  state = defaultPlayground,
  action: SourceActionType
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
    case UPDATE_SHORT_URL:
      return {
        ...state,
        shortURL: action.payload
      };
    default:
      return state;
  }
};
