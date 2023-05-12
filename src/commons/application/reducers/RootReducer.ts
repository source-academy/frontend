import { combineReducers } from 'redux';
import { ApplicationReducer as application } from 'src/commons/application/ApplicationReducer';
import { FileSystemReducer as fileSystem } from 'src/commons/fileSystem/FileSystemReducer';
import { WorkspaceReducer as workspaces } from 'src/commons/workspace/WorkspaceReducer';
import { AcademyReducer as academy } from 'src/features/academy/AcademyReducer';
import { AchievementReducer as achievement } from 'src/features/achievement/AchievementReducer';
import { DashboardReducer as dashboard } from 'src/features/dashboard/DashboardReducer';
import { PlaygroundReducer as playground } from 'src/features/playground/PlaygroundReducer';

import { SessionsReducer as session } from './SessionsReducer';

const createRootReducer = () =>
  combineReducers({
    academy,
    achievement,
    application,
    dashboard,
    playground,
    session,
    workspaces,
    fileSystem
  });

export default createRootReducer;
