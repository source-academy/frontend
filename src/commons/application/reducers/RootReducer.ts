import { combineReducers, Reducer } from '@reduxjs/toolkit';
import { SourceActionType } from 'src/commons/utils/ActionsHelper';

import { AchievementReducer as achievement } from '../../../features/achievement/AchievementReducer';
import { DashboardReducer as dashboard } from '../../../features/dashboard/DashboardReducer';
import { PlaygroundReducer as playground } from '../../../features/playground/PlaygroundReducer';
import { StoriesReducer as stories } from '../../../features/stories/StoriesReducer';
import { FileSystemReducer as fileSystem } from '../../fileSystem/FileSystemReducer';
import { SideContentReducer as sideContent } from '../../sideContent/SideContentReducer';
import { WorkspaceReducer as workspaces } from '../../workspace/WorkspaceReducer';
import { OverallState } from '../ApplicationTypes';
import { RouterReducer as router } from './CommonsReducer';
import { SessionsReducer as session } from './SessionsReducer';
import { VscodeReducer as vscode } from './VscodeReducer';

const rootReducer: Reducer<OverallState, SourceActionType> = combineReducers({
  router,
  achievement,
  dashboard,
  playground,
  session,
  stories,
  workspaces,
  fileSystem,
  sideContent,
  vscode
});

export default rootReducer;
