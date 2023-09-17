import { combineReducers } from 'redux';
import { ApplicationReducer as application } from 'src/commons/application/ApplicationReducer';
import { FileSystemReducer as fileSystem } from 'src/commons/fileSystem/FileSystemReducer';
import { WorkspaceReducer as workspaces } from 'src/commons/workspace/WorkspaceReducer';
import { AcademyReducer as academy } from 'src/features/academy/AcademyReducer';
import { AchievementReducer as achievement } from 'src/features/achievement/AchievementReducer';
import { DashboardReducer as dashboard } from 'src/features/dashboard/DashboardReducer';
import { PlaygroundReducer as playground } from 'src/features/playground/PlaygroundReducer';
import { StoriesReducer as stories } from 'src/features/stories/StoriesReducer';

import { RouterReducer as router } from './CommonsReducer';
import { SessionsReducer as session } from './SessionsReducer';

const createRootReducer = () =>
  combineReducers({
    router,
    academy,
    achievement,
    application,
    dashboard,
    playground,
    session,
    stories,
    workspaces,
    fileSystem
  });

export default createRootReducer;
