import { Store } from 'redux';
import * as mockStore from 'redux-mock-store';

import {
  defaultAcademy,
  defaultApplication,
  defaultPlayground,
  defaultSession,
  defaultWorkspaceManager,
  IState
} from '../reducers/states';

export function mockInitialStore<P>(): Store<IState> {
  const createStore = (mockStore as any)();
  const state: IState = {
    academy: defaultAcademy,
    application: defaultApplication,
    playground: defaultPlayground,
    workspaces: defaultWorkspaceManager,
    session: defaultSession
  };
  return createStore(state);
}
