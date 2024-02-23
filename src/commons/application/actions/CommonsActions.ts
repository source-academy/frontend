import { createAction } from '@reduxjs/toolkit';
import { Router } from '@remix-run/router';

import { LOG_OUT, UPDATE_REACT_ROUTER } from '../types/CommonsTypes';

export const logOut = createAction(LOG_OUT, () => ({ payload: {} }));
export const updateReactRouter = createAction(UPDATE_REACT_ROUTER, (updatedRouter: Router) => ({
  payload: updatedRouter
}));
