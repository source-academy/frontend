import { Store } from '@reduxjs/toolkit';
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
  defaultStories,
  defaultVscode,
  defaultWorkspaceManager,
  OverallState
} from '../application/ApplicationTypes';
import { defaultFeatureFlags } from '../featureFlags';
import { SourceActionType } from '../utils/ActionsHelper';
import { DeepPartial } from '../utils/TypeHelper';

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
    stories: defaultStories,
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
