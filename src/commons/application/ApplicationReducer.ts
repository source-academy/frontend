import { Action, Reducer } from 'redux';
import { defaultApplication, IApplicationState } from 'src/commons/states/ApplicationStates';

export const ApplicationReducer: Reducer<IApplicationState> = (state = defaultApplication, action: Action) => {
  return state;
};
