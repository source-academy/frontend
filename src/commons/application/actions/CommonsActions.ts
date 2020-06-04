import { action } from 'typesafe-actions'; // EDITED

import { LOG_OUT } from '../types/CommonsTypes';

export const logOut = () => action(LOG_OUT);
