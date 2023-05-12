import { LOG_OUT } from 'src/commons/application/types/CommonsTypes';
import { action } from 'typesafe-actions'; // EDITED

export const logOut = () => action(LOG_OUT);
