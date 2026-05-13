import type { Store } from '@reduxjs/toolkit';
import _ from 'lodash';
import mockStore from 'redux-mock-store';

import {
  defaultAchievement,
  defaultDashboard,
  defaultFileSystem,
  defaultLanguageDirectory,
  defaultLeaderboard,
  defaultPlayground,
  defaultPluginDirectory,
  defaultRouter,
  defaultSession,
  defaultSideContentManager,
  defaultVscode,
  defaultWorkspaceManager,
  type OverallState
} from '../application/ApplicationTypes';
import { defaultFeatureFlags } from '../featureFlags';
import type { SourceActionType } from '../utils/ActionsHelper';
import type { DeepPartial } from '../utils/TypeHelper';

export function mockInitialStore(
  overrides?: DeepPartial<OverallState>
): Store<OverallState, SourceActionType> {
  const createStore = (mockStore as any)();
  const state: OverallState = {
    router: defaultRouter,
    achievement: defaultAchievement,
    leaderboard: defaultLeaderboard,
    dashboard: defaultDashboard,
    playground: defaultPlayground,
    workspaces: defaultWorkspaceManager,
    session: defaultSession,
    featureFlags: defaultFeatureFlags,
    fileSystem: defaultFileSystem,
    sideContent: defaultSideContentManager,
    vscode: defaultVscode,
    languageDirectory: defaultLanguageDirectory,
    pluginDirectory: defaultPluginDirectory
  };

  const lodashMergeCustomizer = (objValue: any, srcValue: any) => {
    if (_.isObject(objValue)) {
      return {
        ...objValue, // destination object
        ...srcValue // overrides
      };
    }
  };

  return createStore(_.mergeWith(state, overrides, lodashMergeCustomizer));
}
