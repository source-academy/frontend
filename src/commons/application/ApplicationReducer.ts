import { Action, Reducer } from 'redux';
import { ApplicationState, defaultApplication } from 'src/commons/application/ApplicationTypes';

export const ApplicationReducer: Reducer<ApplicationState> = (
  state = defaultApplication,
  action: Action
) => {
  return state;
};
