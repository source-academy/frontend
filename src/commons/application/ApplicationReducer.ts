import { Action, Reducer } from 'redux';

import { ApplicationState, defaultApplication } from './ApplicationTypes';

export const ApplicationReducer: Reducer<ApplicationState> = (
  state = defaultApplication,
  action: Action
) => {
  return state;
};
