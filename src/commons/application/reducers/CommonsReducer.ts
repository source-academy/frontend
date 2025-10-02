import { createReducer } from '@reduxjs/toolkit';

import { defaultRouter } from '../ApplicationTypes';
import { updateReactRouter } from '../actions/CommonsActions';

export const RouterReducer = createReducer(defaultRouter, builder => {
  builder.addCase(updateReactRouter, (state, action) => {
    return action.payload;
  });
});
