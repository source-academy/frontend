import { combineReducers, type Reducer } from '@reduxjs/toolkit';

import { FeatureFlagsReducer as featureFlags } from '../../..//commons/featureFlags';
import { AchievementReducer as achievement } from '../../../features/achievement/AchievementReducer';
import { DashboardReducer as dashboard } from '../../../features/dashboard/DashboardReducer';
import { LanguageDirectoryReducer as languageDirectory } from '../../../features/directory/LanguageDirectoryReducer';
import { PluginDirectoryReducer as pluginDirectory } from '../../../features/directory/PluginDirectoryReducer';
import { LeaderboardReducer as leaderboard } from '../../../features/leaderboard/LeaderboardReducer';
import { PlaygroundReducer as playground } from '../../../features/playground/PlaygroundReducer';
import { StoriesReducer as stories } from '../../../features/stories/StoriesReducer';
import { FileSystemReducer as fileSystem } from '../../fileSystem/FileSystemReducer';
import { SideContentReducer as sideContent } from '../../sideContent/SideContentReducer';
import type { SourceActionType } from '../../utils/ActionsHelper';
import { WorkspaceReducer as workspaces } from '../../workspace/WorkspaceReducer';
import { OverallState } from '../ApplicationTypes';
import { RouterReducer as router } from './CommonsReducer';
import { SessionsReducer as session } from './SessionsReducer';
import { VscodeReducer as vscode } from './VscodeReducer';

const rootReducer: Reducer<OverallState, SourceActionType> = combineReducers({
  router,
  achievement,
  leaderboard,
  dashboard,
  playground,
  session,
  stories,
  workspaces,
  featureFlags,
  fileSystem,
  sideContent,
  vscode,
  languageDirectory,
  pluginDirectory
});

export default rootReducer;
