import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import { combineReducers } from 'redux';

import { AcademyReducer as academy } from '../../../features/academy/AcademyReducer';
import { AchievementReducer as achievement } from '../../../features/achievement/AchievementReducer';
import { DashboardReducer as dashboard } from '../../../features/dashboard/DashboardReducer';
import { PlaygroundReducer as playground } from '../../../features/playground/PlaygroundReducer';
import { SicpReducer as sicp } from '../../../features/sicp/SicpReducer';
import { WorkspaceReducer as workspaces } from '../../workspace/WorkspaceReducer';
import { ApplicationReducer as application } from '../ApplicationReducer';
import { SessionsReducer as session } from './SessionsReducer';

const createRootReducer = (history: History) =>
  combineReducers({
    router: connectRouter(history),
    academy,
    achievement,
    application,
    dashboard,
    playground,
    session,
    sicp,
    workspaces
  });

export default createRootReducer;
