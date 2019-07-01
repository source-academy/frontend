import { ActionCreator } from 'redux';

import * as actionTypes from './actionTypes';

export const fetchRepos = () => ({
  type: actionTypes.FETCH_REPOS
});

export const addRepos: ActionCreator<actionTypes.IAction> = (repos) => ({
  type: actionTypes.ADD_REPOS,
  payload: repos
});

export const addContributors: ActionCreator<actionTypes.IAction> = (contributors) => ({
  type: actionTypes.ADD_CONTRIBUTORS,
  payload: contributors
});