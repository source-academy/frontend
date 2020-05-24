import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import { combineReducers } from 'redux';

import { reducer as academy } from './academy';
import { reducer as application } from './application';
import { reducer as dashboard } from './dashboard';
import { reducer as playground } from './playground';
import { reducer as session } from './session';
import { reducer as workspaces } from './workspaces';

const createRootReducer = (history: History) =>
  combineReducers({
    router: connectRouter(history),
    academy,
    application,
    dashboard,
    playground,
    session,
    workspaces
  });

export default createRootReducer;
