import { Reducer } from 'redux';

import { defaultPlayground } from 'src/commons/application/ApplicationTypes';
import { SourceActionType } from 'src/utils/actionsHelper';

import {
  CHANGE_QUERY_STRING,
  PlaygroundState,
  TOGGLE_USING_SUBST,
  UPDATE_SHORT_URL
} from './PlaygroundTypes';

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
