import _ from 'lodash';
import { DeepPartial, Store } from 'redux';
import mockStore from 'redux-mock-store';

import {
  defaultAcademy,
  defaultAchievement,
  defaultDashboard,
  defaultFileSystem,
  defaultPlayground,
  defaultRouter,
  defaultSession,
  defaultStories,
  defaultWorkspaceManager,
  OverallState
} from '../application/ApplicationTypes';

export function mockInitialStore(overrides?: DeepPartial<OverallState>): Store<OverallState> {
  const createStore = (mockStore as any)();
  const state: OverallState = {
    router: defaultRouter,
    academy: defaultAcademy,
    achievement: defaultAchievement,
    dashboard: defaultDashboard,
    playground: defaultPlayground,
    workspaces: defaultWorkspaceManager,
    session: defaultSession,
    stories: defaultStories,
    fileSystem: defaultFileSystem
  };
  return createStore(_.merge(state, overrides));
}
