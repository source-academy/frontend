import { AcademyState } from '../../features/academy/AcademyTypes';
import { AchievementState } from '../../features/achievement/AchievementTypes';
import { DashboardState } from '../../features/dashboard/DashboardTypes';
import { RouterState } from '../application/types/CommonsTypes';
import { FileSystemState } from '../fileSystem/FileSystemTypes';
import { ApplicationState, defaultApplication } from './ApplicationRedux';
import { defaultRouter } from './RouterReducer';
import { defaultSession, SessionState } from './session/SessionsReducer';
import {
  defaultWorkspaceManager,
  WorkspaceManagerState
} from './workspace/WorkspaceReduxTypes';

export type OverallState = {
  academy: AcademyState;
  achievement: AchievementState;
  application: ApplicationState;
  dashboard: DashboardState;
  fileSystem: FileSystemState;
  router: RouterState;
  session: SessionState;
  workspaces: WorkspaceManagerState;
};

export const defaultAcademy: AcademyState = {
  gameCanvas: undefined
};

export const defaultAchievement: AchievementState = {
  achievements: [],
  goals: [],
  users: [],
  assessmentOverviews: []
};

export const defaultDashboard: DashboardState = {
  gradingSummary: {
    cols: [],
    rows: []
  }
};

export const defaultFileSystem: FileSystemState = {
  inBrowserFileSystem: null
};

export const defaultState: OverallState = {
  academy: defaultAcademy,
  achievement: defaultAchievement,
  application: defaultApplication,
  dashboard: defaultDashboard,
  fileSystem: defaultFileSystem,
  router: defaultRouter,
  session: defaultSession,
  workspaces: defaultWorkspaceManager
};
