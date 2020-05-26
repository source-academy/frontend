import { Action, Reducer } from 'redux';
import { defaultApplication, IApplicationState } from 'src/commons/application/ApplicationTypes';

export const ApplicationReducer: Reducer<IApplicationState> = (
  state = defaultApplication,
  action: Action
) => {
  return state;
};
