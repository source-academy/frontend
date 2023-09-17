import { Router } from '@remix-run/router';
import { LOG_OUT, UPDATE_REACT_ROUTER } from 'src/commons/application/types/CommonsTypes';
import { action } from 'typesafe-actions'; // EDITED

export const logOut = () => action(LOG_OUT);
export const updateReactRouter = (updatedRouter: Router) =>
  action(UPDATE_REACT_ROUTER, updatedRouter);
