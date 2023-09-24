import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Router } from '@remix-run/router';

export type RouterState = Router | null;

export const defaultRouter: RouterState = null;
export const { actions: routerActions, reducer: routerReducer } = createSlice({
  name: 'router',
  initialState: defaultRouter as RouterState,
  reducers: {
    updateReactRouter(_, { payload }: PayloadAction<Router>) {
      return payload
    }
  }
})
