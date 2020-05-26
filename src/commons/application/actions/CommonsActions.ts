import { action } from 'typesafe-actions'; // EDITED

import * as actionTypes from 'src/commons/application/types/ActionTypes';

export const logOut = () => action(actionTypes.LOG_OUT);
