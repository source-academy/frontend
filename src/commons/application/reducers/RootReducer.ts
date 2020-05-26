import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import { combineReducers } from 'redux';

import { AcademyReducer } from 'src/features/academy/AcademyReducer';
import { ApplicationReducer } from 'src/commons/application/ApplicationReducer';
import { DashboardReducer } from 'src/features/dashboard/DashboardReducer';
import { PlaygroundReducer } from 'src/features/playground/PlaygroundReducer';
import { SessionsReducer } from 'src/commons/application/reducers/SessionsReducer';
import { WorkspaceReducer } from 'src/commons/workspace/WorkspaceReducer';

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
