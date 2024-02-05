import { combineReducers } from 'redux';

import { AcademyReducer as academy } from '../../../features/academy/AcademyReducer';
import { AchievementReducer as achievement } from '../../../features/achievement/AchievementReducer';
import { DashboardReducer as dashboard } from '../../../features/dashboard/DashboardReducer';
import { PlaygroundReducer as playground } from '../../../features/playground/PlaygroundReducer';
import { StoriesReducer as stories } from '../../../features/stories/StoriesReducer';
import { FileSystemReducer as fileSystem } from '../../fileSystem/FileSystemReducer';
import { WorkspaceReducer as workspaces } from '../../workspace/WorkspaceReducer';
import { RouterReducer as router } from './CommonsReducer';
import { SessionsReducer as session } from './SessionsReducer';

const createRootReducer = () =>
  combineReducers({
    router,
    academy,
    achievement,
    dashboard,
    playground,
    session,
    stories,
    workspaces,
    fileSystem
  });

export default createRootReducer;
