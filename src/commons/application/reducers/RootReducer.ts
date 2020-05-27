import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import { combineReducers } from 'redux';

import { AcademyReducer } from '../../../features/academy/AcademyReducer';
import { DashboardReducer } from '../../../features/dashboard/DashboardReducer';
import { PlaygroundReducer } from '../../../features/playground/PlaygroundReducer';
import { WorkspaceReducer } from '../../workspace/WorkspaceReducer';
import { ApplicationReducer } from '../ApplicationReducer';
import { SessionsReducer } from './SessionsReducer';

const createRootReducer = (history: History) =>
  combineReducers({
    router: connectRouter(history),
    AcademyReducer,
    ApplicationReducer,
    DashboardReducer,
    PlaygroundReducer,
    SessionsReducer,
    WorkspaceReducer
  });

export default createRootReducer;
