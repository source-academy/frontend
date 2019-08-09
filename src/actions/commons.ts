import { action } from 'typesafe-actions';

import * as actionTypes from './actionTypes';

export const logOut = () => action(actionTypes.LOG_OUT);
