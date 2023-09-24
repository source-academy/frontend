import { academyActions } from "./academy/AcademyReducer"
import { achievementActions } from './achievement/AchievementReducer'
import { dashboardActions } from "./DashboardRedux"
import { routerActions } from "./RouterReducer"
import { sessionReducerActions } from "./session/SessionsReducer"
import { allWorkspaceActions } from "./workspace/AllWorkspacesRedux"
import { assessmentActions } from "./workspace/assessment/AssessmentRedux"
import { gradingActions } from "./workspace/assessment/GradingRedux"
import { playgroundActions } from "./workspace/playground/PlaygroundRedux"
import { sourcecastActions } from "./workspace/sourceRecorder/SourcecastRedux"
import { sourcereelActions } from "./workspace/sourceRecorder/SourcereelRedux"

export const actions = {
  ...academyActions,
  ...achievementActions,
  ...allWorkspaceActions,
  ...assessmentActions,
  ...dashboardActions,
  ...gradingActions,
  ...playgroundActions,
  ...routerActions,
  ...sessionReducerActions,
  ...sourcecastActions,
  ...sourcereelActions
}

export type ActionsType = typeof actions
