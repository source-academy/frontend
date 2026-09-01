import { createActions } from 'src/commons/redux/utils';
import type { OptionType } from 'src/pages/academy/teamFormation/subcomponents/TeamFormationForm';

import type { GradingQuery } from '../../../features/grading/GradingTypes';
import type { TeamFormationOverview } from '../../../features/teamFormation/TeamFormationTypes';
import type {
  Assessment,
  AssessmentConfiguration,
  AssessmentOverview,
  ContestEntry,
} from '../../assessment/AssessmentTypes';
import type {
  Notification,
  NotificationFilterFunction,
} from '../../notificationBadge/NotificationBadgeTypes';
import { generateOctokitInstance } from '../../utils/GitHubPersistenceHelper';
import { Role } from '../ApplicationTypes';
import type {
  AdminPanelCourseRegistration,
  CourseRegistration,
  Tokens,
  UpdateCourseConfiguration,
  User,
} from '../types/SessionTypes';

const SessionActions = createActions('session', {
  fetchAuth: (code: string, providerId?: string) => ({ code, providerId }),
  handleSamlRedirect: (jwtCookie: string) => ({ jwtCookie }),
  fetchUserAndCourse: () => ({}),
  fetchCourseConfig: () => ({}),
  fetchAssessment: (assessmentId: number, assessmentPassword?: string) => ({
    assessmentId,
    assessmentPassword,
  }),
  fetchAssessmentAdmin: (assessmentId: number, courseRegId: number) => ({
    assessmentId,
    courseRegId,
  }),
  fetchAssessmentOverviews: () => ({}),
  fetchTotalXp: () => ({}),
  fetchTotalXpAdmin: (courseRegId: number) => courseRegId,
  fetchGrading: (submissionId: number) => submissionId,
  fetchTeamFormationOverviews: (filterToGroup = true) => filterToGroup,
  fetchStudents: () => ({}),
  login: (providerId: string) => providerId,
  logoutGoogle: () => ({}),
  loginGitHub: () => ({}),
  logoutGitHub: () => ({}),
  setTokens: ({ accessToken, refreshToken }: Tokens) => ({ accessToken, refreshToken }),
  setUser: (user: User) => user,
  setCourseConfiguration: (courseConfiguration: UpdateCourseConfiguration) => courseConfiguration,
  setCourseRegistration: (courseRegistration: Partial<CourseRegistration>) => courseRegistration,
  setAssessmentConfigurations: (assessmentConfigurations: AssessmentConfiguration[]) =>
    assessmentConfigurations,
  setAdminPanelCourseRegistrations: (courseRegistrations: AdminPanelCourseRegistration[]) =>
    courseRegistrations,
  setGoogleUser: (user?: string) => user,
  setGitHubOctokitObject: (authToken?: string) => generateOctokitInstance(authToken || ''),
  setGitHubAccessToken: (authToken?: string) => authToken,
  removeGitHubOctokitObjectAndAccessToken: () => ({}),
  submitAnswer: (id: number, answer: string | number | ContestEntry[]) => ({ id, answer }),
  checkAnswerLastModifiedAt: (id: number, lastModifiedAt: string, saveAnswer: Function) => ({
    id,
    lastModifiedAt,
    saveAnswer,
  }),
  submitAssessment: (id: number) => id,
  submitGrading: (
    submissionId: number,
    questionId: number,
    xpAdjustment: number = 0,
    comments?: string,
  ) => ({ submissionId, questionId, xpAdjustment, comments }),
  submitGradingAndContinue: (
    submissionId: number,
    questionId: number,
    xpAdjustment: number = 0,
    comments?: string,
  ) => ({ submissionId, questionId, xpAdjustment, comments }),
  reautogradeAnswer: (submissionId: number, questionId: number) => ({ submissionId, questionId }),
  updateAssessmentOverviews: (overviews: AssessmentOverview[]) => overviews,
  updateTotalXp: (totalXp: number) => totalXp,
  updateAssessment: (assessment: Assessment) => assessment,
  fetchTeamFormationOverview: (assessmentId: number) => ({ assessmentId }),
  createTeam: (assessment: AssessmentOverview, teams: OptionType[][]) => ({ assessment, teams }),
  updateTeam: (teamId: number, assessment: AssessmentOverview, teams: OptionType[][]) => ({
    teamId,
    assessment,
    teams,
  }),
  deleteTeam: (teamId: number) => ({ teamId }),
  bulkUploadTeam: (assessment: AssessmentOverview, file: File, students: User[] | undefined) => ({
    assessment,
    file,
    students,
  }),
  updateTeamFormationOverviews: (overviews: TeamFormationOverview[]) => overviews,
  updateTeamFormationOverview: (overview: TeamFormationOverview) => overview,
  updateStudents: (students: User[]) => students,
  /**
   * An extra id parameter is included here because of
   * no id for Grading.
   */
  updateGrading: (submissionId: number, grading: GradingQuery) => ({ submissionId, grading }),
  // Notification actions
  fetchNotifications: () => ({}),
  acknowledgeNotifications: (withFilter?: NotificationFilterFunction) => ({ withFilter }),
  updateNotifications: (notifications: Notification[]) => notifications,
  updateLatestViewedCourse: (courseId: number) => ({ courseId }),
  updateCourseConfig: (courseConfiguration: UpdateCourseConfiguration) => courseConfiguration,
  fetchAssessmentConfigs: () => ({}),
  updateAssessmentConfigs: (assessmentConfigs: AssessmentConfiguration[]) => assessmentConfigs,
  deleteAssessmentConfig: (assessmentConfig: AssessmentConfiguration) => assessmentConfig,
  fetchAdminPanelCourseRegistrations: () => ({}),
  updateUserRole: (courseRegId: number, role: Role) => ({ courseRegId, role }),
  deleteUserCourseRegistration: (courseRegId: number) => ({ courseRegId }),
  updateCourseResearchAgreement: (agreedToResearch: boolean) => ({ agreedToResearch }),
});

// For compatibility with existing code (actions helper)
export default SessionActions;
