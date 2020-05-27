import { action } from 'typesafe-actions';

import {
  CHANGE_QUERY_STRING,
  GENERATE_LZ_STRING,
  SHORTEN_URL,
  TOGGLE_USING_SUBST,
  UPDATE_SHORT_URL
} from './PlaygroundTypes';

export const generateLzString = () => action(GENERATE_LZ_STRING);

export const shortenURL = (keyword: string) => action(SHORTEN_URL, keyword);

export const updateShortURL = (shortURL: string) => action(UPDATE_SHORT_URL, shortURL);

export const toggleUsingSubst = (usingSubst: boolean) => action(TOGGLE_USING_SUBST, usingSubst);

export const changeQueryString = (queryString: string) => action(CHANGE_QUERY_STRING, queryString);
