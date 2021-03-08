import { action } from 'typesafe-actions'; // EDITED

import { LOG_OUT } from '../types/CommonsTypes';
import { LOG_IN } from '../types/CommonsTypes';

export const logOut = () => action(LOG_OUT);

export const logIn = () => action(LOG_IN);
