import { action } from 'typesafe-actions';

import * as actionTypes from './actionTypes';

export const generateLzString = () => action(actionTypes.GENERATE_LZ_STRING);

export const shortenURL = (keyword: string) => action(actionTypes.SHORTEN_URL, keyword);

export const updateShortURL = (shortURL: string) => action(actionTypes.UPDATE_SHORT_URL, shortURL);

export const toggleUsingSubst = (usingSubst: boolean) =>
  action(actionTypes.TOGGLE_USING_SUBST, usingSubst);

export const changeQueryString = (queryString: string) =>
  action(actionTypes.CHANGE_QUERY_STRING, queryString);
