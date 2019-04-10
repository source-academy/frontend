import { ActionCreator } from 'redux';

import * as actionTypes from './actionTypes';

export const generateLzString = () => ({
  type: actionTypes.GENERATE_LZ_STRING
});

export const changeQueryString: ActionCreator<actionTypes.IAction> = (queryString: string) => ({
  type: actionTypes.CHANGE_QUERY_STRING,
  payload: queryString
});
