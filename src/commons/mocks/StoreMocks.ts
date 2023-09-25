import _ from 'lodash';
import { DeepPartial, Store } from 'redux';
import mockStore from 'redux-mock-store';

import { defaultAcademy, defaultAchievement, defaultDashboard, defaultFileSystem, OverallState } from '../redux/AllTypes';
import { defaultApplication } from '../redux/ApplicationRedux';
import { defaultRouter } from '../redux/RouterReducer';
import { defaultSession } from '../redux/session/SessionsReducer';
import { defaultWorkspaceManager } from '../redux/workspace/WorkspaceReduxTypes';

export function mockInitialStore(overrides?: DeepPartial<OverallState>): Store<OverallState> {
  const createStore = (mockStore as any)();
  const state: OverallState = {
    router: defaultRouter,
    academy: defaultAcademy,
    achievement: defaultAchievement,
    application: defaultApplication,
    dashboard: defaultDashboard,
    workspaces: defaultWorkspaceManager,
    session: defaultSession,
    fileSystem: defaultFileSystem
  };
  return createStore(_.merge(state, overrides));
}
