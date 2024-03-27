import { combineReducers } from 'redux';

import { AchievementReducer as achievement } from '../../../features/achievement/AchievementReducer';
import { DashboardReducer as dashboard } from '../../../features/dashboard/DashboardReducer';
import { PlaygroundReducer as playground } from '../../../features/playground/PlaygroundReducer';
import { StoriesReducer as stories } from '../../../features/stories/StoriesReducer';
import { FileSystemReducer as fileSystem } from '../../fileSystem/FileSystemReducer';
import { SideContentReducer as sideContent } from '../../sideContent/SideContentReducer';
import { WorkspaceReducer as workspaces } from '../../workspace/WorkspaceReducer';
import { RouterReducer as router } from './CommonsReducer';
import { SessionsReducer as session } from './SessionsReducer';

const createRootReducer = () =>
  combineReducers({
    router,
    achievement,
    dashboard,
    playground,
    session,
    stories,
    workspaces,
    fileSystem,
    sideContent
  });

export default createRootReducer;
