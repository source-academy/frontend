import { action } from 'typesafe-actions';

import * as actionTypes from './actionTypes';

export const generateLzString = () => action(actionTypes.GENERATE_LZ_STRING);

export const changeQueryString = (queryString: string) =>
  action(actionTypes.CHANGE_QUERY_STRING, queryString);
