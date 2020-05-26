import { Reducer } from 'redux';

import { defaultPlayground, PlaygroundState } from 'src/commons/application/ApplicationTypes';
import {
  CHANGE_QUERY_STRING,
  TOGGLE_USING_SUBST,
  UPDATE_SHORT_URL
} from 'src/commons/application/types/ActionTypes';
import { SourceActionType } from 'src/utils/actionsHelper';

export const PlaygroundReducer: Reducer<PlaygroundState> = (
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
