import { Reducer } from 'redux';

import { ADD_CONTRIBUTORS, ADD_REPOS, FETCH_REPOS, IAction } from '../actions/actionTypes';
import { defaultContributors, IContributorsState } from './states';

export const reducer: Reducer<IContributorsState> = (state = defaultContributors, action: IAction) => {
  switch (action.type) {
    case ADD_REPOS:
      return {
        ...state,
        repos: [...state.repos, action.payload]
      };
    case ADD_CONTRIBUTORS:
      return {
        ...state,
        contributors: [...state.contributors, action.payload]
      };
    case FETCH_REPOS: 
      return state;
    default:
      return state;
  }
};