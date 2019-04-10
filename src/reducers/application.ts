import { Action, Reducer } from 'redux';
import { defaultApplication, IApplicationState } from './states';

export const reducer: Reducer<IApplicationState> = (state = defaultApplication, action: Action) => {
  return state;
};
