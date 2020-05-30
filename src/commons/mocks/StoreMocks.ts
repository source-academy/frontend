import { Store } from 'redux';
import mockStore from 'redux-mock-store';
import { OverallState, defaultAcademy, defaultApplication, defaultDashBoard, defaultPlayground, defaultWorkspaceManager, defaultSession } from '../application/ApplicationTypes';

export function mockInitialStore<P>(): Store<OverallState> {
  const createStore = (mockStore as any)();
  const state: OverallState = {
    academy: defaultAcademy,
    application: defaultApplication,
    dashboard: defaultDashBoard,
    playground: defaultPlayground,
    workspaces: defaultWorkspaceManager,
    session: defaultSession
  };
  return createStore(state);
}
