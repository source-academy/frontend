import { createReducer } from '@reduxjs/toolkit';

import { updateReactRouter } from '../actions/CommonsActions';
import { defaultRouter } from '../ApplicationTypes';

export const RouterReducer = createReducer(defaultRouter, builder => {
  builder.addCase(updateReactRouter, (state, action) => {
    return action.payload;
  });
});
