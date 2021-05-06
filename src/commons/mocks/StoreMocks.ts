import { Store } from 'redux';
import mockStore from 'redux-mock-store';

import {
  defaultAcademy,
  defaultAchievement,
  defaultApplication,
  defaultDashboard,
  defaultPlayground,
  defaultSession,
  defaultSicp,
  defaultWorkspaceManager,
  OverallState
} from '../application/ApplicationTypes';

export function mockInitialStore(): Store<OverallState> {
  const createStore = (mockStore as any)();
  const state: OverallState = {
    academy: defaultAcademy,
    achievement: defaultAchievement,
    application: defaultApplication,
    dashboard: defaultDashboard,
    playground: defaultPlayground,
    workspaces: defaultWorkspaceManager,
    session: defaultSession,
    sicp: defaultSicp
  };
  return createStore(state);
}
