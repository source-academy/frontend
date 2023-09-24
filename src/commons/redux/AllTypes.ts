
import { AcademyState } from "../../features/academy/AcademyTypes"
import { AchievementState } from "../../features/achievement/AchievementTypes"
import { DashboardState } from "../../features/dashboard/DashboardTypes"
import { defaultFileSystem } from "../application/ApplicationTypes"
import { RouterState } from "../application/types/CommonsTypes"
import { FileSystemState } from "../fileSystem/FileSystemTypes"
import { defaultAcademy } from "./academy/AcademyReducer"
import { defaultAchievement } from "./achievement/AchievementReducer"
import { ApplicationState, defaultApplication } from "./ApplicationRedux"
import { defaultRouter } from "./RouterReducer"
import { defaultSession,SessionState } from "./session/SessionsReducer"
import { defaultWorkspaceManager,SideContentLocation,WorkspaceManagerState } from "./workspace/WorkspaceReduxTypes"

const defaultFileName = 'program.js';
export const getDefaultFilePath = (workspaceLocation: SideContentLocation) =>
  `${getWorkspaceBasePath(workspaceLocation)}/${defaultFileName}`;

export type OverallState = {
  academy: AcademyState
  achievement: AchievementState
  application: ApplicationState,
  dashboard: DashboardState
  fileSystem: FileSystemState
  router: RouterState,
  session: SessionState
  workspaces: WorkspaceManagerState
}

export const defaultDashboard: DashboardState = {
  gradingSummary: {
    cols: [],
    rows: []
  }
};

export const defaultState: OverallState = {
  academy: defaultAcademy,
  achievement: defaultAchievement,
  application: defaultApplication,
  dashboard: defaultDashboard,
  fileSystem: defaultFileSystem,
  router: defaultRouter,
  session: defaultSession,
  workspaces: defaultWorkspaceManager,
}


