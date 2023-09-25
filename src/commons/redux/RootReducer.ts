import { combineReducers } from '@reduxjs/toolkit';

import { AcademyReducer } from './academy/AcademyReducer';
import { AchievementReducer } from './achievement/AchievementReducer';
import { OverallState } from './AllTypes';
import { applicationReducer } from './ApplicationRedux';
import { dashboardReducer } from './DashboardRedux';
import { fileSystemReducer } from './FileSystemRedux';
import { routerReducer } from './RouterReducer';
import { sessionsReducer } from './session/SessionsReducer';
import { allWorkspacesReducer } from './workspace/AllWorkspacesRedux';

const rootReducer = combineReducers<OverallState>({
  academy: AcademyReducer,
  achievement: AchievementReducer,
  application: applicationReducer,
  dashboard: dashboardReducer,
  fileSystem: fileSystemReducer,
  router: routerReducer,
  session: sessionsReducer,
  workspaces: allWorkspacesReducer
});

export default rootReducer;
