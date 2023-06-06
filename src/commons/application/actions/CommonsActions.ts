import { Router } from '@remix-run/router';
import { action } from 'typesafe-actions'; // EDITED

import { LOG_OUT, UPDATE_REACT_ROUTER } from '../types/CommonsTypes';

export const logOut = () => action(LOG_OUT);
export const updateReactRouter = (updatedRouter: Router) =>
  action(UPDATE_REACT_ROUTER, updatedRouter);
