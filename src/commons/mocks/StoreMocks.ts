import { Store } from 'redux';
import mockStore from 'redux-mock-store';

import { defaultAchievement } from '../achievement/AchievementTypes';
import {
  defaultAcademy,
  defaultApplication,
  defaultDashboard,
  defaultPlayground,
  defaultSession,
  defaultWorkspaceManager,
  OverallState
} from '../application/ApplicationTypes';

export function mockInitialStore<P>(): Store<OverallState> {
  const createStore = (mockStore as any)();
  const state: OverallState = {
    academy: defaultAcademy,
    achievement: defaultAchievement,
    application: defaultApplication,
    dashboard: defaultDashboard,
    playground: defaultPlayground,
    workspaces: defaultWorkspaceManager,
    session: defaultSession
  };
  return createStore(state);
}
