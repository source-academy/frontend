import { combineReducers } from 'redux';

import { AcademyReducer as academy } from '../../../features/academy/AcademyReducer';
import { AchievementReducer as achievement } from '../../../features/achievement/AchievementReducer';
import { DashboardReducer as dashboard } from '../../../features/dashboard/DashboardReducer';
import { PlaygroundReducer as playground } from '../../../features/playground/PlaygroundReducer';
import { FileSystemReducer as fileSystem } from '../../fileSystem/FileSystemReducer';
import { WorkspaceReducer as workspaces } from '../../workspace/WorkspaceReducer';
import { ApplicationReducer as application } from '../ApplicationReducer';
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
