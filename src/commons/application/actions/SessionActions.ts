import { createAction } from '@reduxjs/toolkit';
import { createActions } from 'src/commons/redux/utils';
import {
  paginationToBackendParams,
  unpublishedToBackendParams
} from 'src/features/grading/GradingUtils';
import { OptionType } from 'src/pages/academy/teamFormation/subcomponents/TeamFormationForm';

import { GradingOverviews, GradingQuery } from '../../../features/grading/GradingTypes';
import { TeamFormationOverview } from '../../../features/teamFormation/TeamFormationTypes';
import {
  Assessment,
  AssessmentConfiguration,
  AssessmentOverview,
  ContestEntry
} from '../../assessment/AssessmentTypes';
import {
  Notification,
  NotificationFilterFunction
} from '../../notificationBadge/NotificationBadgeTypes';
import { generateOctokitInstance } from '../../utils/GitHubPersistenceHelper';
import { Role, StoriesRole } from '../ApplicationTypes';
import {
  AdminPanelCourseRegistration,
  CourseRegistration,
  DELETE_STORIES_USER_USER_GROUPS,
  NotificationConfiguration,
  NotificationPreference,
  TimeOption,
  Tokens,
  UPDATE_ASSESSMENT,
  UPDATE_COURSE_RESEARCH_AGREEMENT,
  UPDATE_STORIES_USER_ROLE,
  UPDATE_TOTAL_XP,
  UpdateCourseConfiguration,
  User
} from '../types/SessionTypes';

const newActions = createActions('session', {
  fetchAuth: (code: string, providerId?: string) => ({ code, providerId }),
  fetchUserAndCourse: () => ({}),
  fetchCourseConfig: () => ({}),
  fetchAssessment: (assessmentId: number, assessmentPassword?: string) => ({
    assessmentId,
    assessmentPassword
  }),
  fetchAssessmentAdmin: (assessmentId: number, courseRegId: number) => ({
    assessmentId,
    courseRegId
  }),
  fetchAssessmentOverviews: () => ({}),
  fetchTotalXp: () => ({}),
  fetchTotalXpAdmin: (courseRegId: number) => courseRegId,
  fetchGrading: (submissionId: number) => submissionId,
  /**
   * @param filterToGroup - param that when set to true, only shows submissions under the group
   * of the grader
   * @param publishedFilter - backend params to filter to unpublished
   * @param pageParams - param that contains offset and pageSize, informing backend about how
   * many entries, starting from what offset, to get
   * @param filterParams - param that contains columnFilters converted into JSON for
   * processing into query parameters
   */
  fetchGradingOverviews: (
    filterToGroup = true,
    publishedFilter = unpublishedToBackendParams(false),
    pageParams = paginationToBackendParams(0, 10),
    filterParams = {}
  ) => ({ filterToGroup, publishedFilter, pageParams, filterParams }),
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
  setConfigurableNotificationConfigs: (notificationConfigs: NotificationConfiguration[]) =>
    notificationConfigs,
  setNotificationConfigs: (notificationConfigs: NotificationConfiguration[]) => notificationConfigs,
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
    saveAnswer
  }),
  submitAssessment: (id: number) => id,
  submitGrading: (
    submissionId: number,
    questionId: number,
    xpAdjustment: number = 0,
    comments?: string
  ) => ({ submissionId, questionId, xpAdjustment, comments }),
  submitGradingAndContinue: (
    submissionId: number,
    questionId: number,
    xpAdjustment: number = 0,
    comments?: string
  ) => ({ submissionId, questionId, xpAdjustment, comments }),
  reautogradeSubmission: (submissionId: number) => submissionId,
  reautogradeAnswer: (submissionId: number, questionId: number) => ({ submissionId, questionId }),
  updateAssessmentOverviews: (overviews: AssessmentOverview[]) => overviews
});

export const updateTotalXp = createAction(UPDATE_TOTAL_XP, (totalXp: number) => ({
  payload: totalXp
}));

export const updateAssessment = createAction(UPDATE_ASSESSMENT, (assessment: Assessment) => ({
  payload: assessment
}));

const newActions2 = createActions('session', {
  updateGradingOverviews: (overviews: GradingOverviews) => overviews,
  fetchTeamFormationOverview: (assessmentId: number) => ({ assessmentId }),
  createTeam: (assessment: AssessmentOverview, teams: OptionType[][]) => ({ assessment, teams }),
  updateTeam: (teamId: number, assessment: AssessmentOverview, teams: OptionType[][]) => ({
    teamId,
    assessment,
    teams
  }),
  deleteTeam: (teamId: number) => ({ teamId }),
  bulkUploadTeam: (assessment: AssessmentOverview, file: File, students: User[] | undefined) => ({
    assessment,
    file,
    students
  }),
  updateTeamFormationOverviews: (overviews: TeamFormationOverview[]) => overviews,
  updateTeamFormationOverview: (overview: TeamFormationOverview) => overview,
  updateStudents: (students: User[]) => students,
  /**
   * An extra id parameter is included here because of
   * no id for Grading.
   */
  updateGrading: (submissionId: number, grading: GradingQuery) => ({ submissionId, grading }),
  unsubmitSubmission: (submissionId: number) => ({ submissionId }),
  // Publishing / unpublishing actions
  publishGrading: (submissionId: number) => ({ submissionId }),
  unpublishGrading: (submissionId: number) => ({ submissionId }),
  // Notification actions
  fetchNotifications: () => ({}),
  acknowledgeNotifications: (withFilter?: NotificationFilterFunction) => ({ withFilter }),
  updateNotifications: (notifications: Notification[]) => notifications,
  updateLatestViewedCourse: (courseId: number) => ({ courseId }),
  updateCourseConfig: (courseConfiguration: UpdateCourseConfiguration) => courseConfiguration,
  fetchAssessmentConfigs: () => ({}),
  updateAssessmentConfigs: (assessmentConfigs: AssessmentConfiguration[]) => assessmentConfigs,
  updateNotificationConfigs: (notificationConfigs: NotificationConfiguration[]) =>
    notificationConfigs,
  updateNotificationPreferences: (
    notificationPreferences: NotificationPreference[],
    courseRegId: number
  ) => ({ notificationPreferences, courseRegId }),
  deleteAssessmentConfig: (assessmentConfig: AssessmentConfiguration) => assessmentConfig,
  fetchAdminPanelCourseRegistrations: () => ({}),
  fetchConfigurableNotificationConfigs: (courseRegId: number) => ({ courseRegId }),
  fetchNotificationConfigs: () => ({}),
  updateTimeOptions: (timeOptions: TimeOption[]) => timeOptions,
  deleteTimeOptions: (timeOptionIds: number[]) => timeOptionIds,
  updateUserRole: (courseRegId: number, role: Role) => ({ courseRegId, role }),
  deleteUserCourseRegistration: (courseRegId: number) => ({ courseRegId })
});

export const updateCourseResearchAgreement = createAction(
  UPDATE_COURSE_RESEARCH_AGREEMENT,
  (agreedToResearch: boolean) => ({ payload: { agreedToResearch } })
);

export const updateStoriesUserRole = createAction(
  UPDATE_STORIES_USER_ROLE,
  (userId: number, role: StoriesRole) => ({ payload: { userId, role } })
);

export const deleteStoriesUserUserGroups = createAction(
  DELETE_STORIES_USER_USER_GROUPS,
  (userId: number) => ({ payload: { userId } })
);

// For compatibility with existing code (reducer)
export const {
  updateGradingOverviews,
  fetchTeamFormationOverview,
  createTeam,
  updateTeam,
  deleteTeam,
  bulkUploadTeam,
  updateTeamFormationOverviews,
  updateTeamFormationOverview,
  updateStudents,
  updateGrading,
  unsubmitSubmission,
  publishGrading,
  unpublishGrading,
  fetchNotifications,
  acknowledgeNotifications,
  updateNotifications,
  updateLatestViewedCourse,
  updateCourseConfig,
  fetchAssessmentConfigs,
  updateAssessmentConfigs,
  updateNotificationConfigs,
  updateNotificationPreferences,
  deleteAssessmentConfig,
  fetchAdminPanelCourseRegistrations,
  fetchConfigurableNotificationConfigs,
  fetchNotificationConfigs,
  updateTimeOptions,
  deleteTimeOptions,
  updateUserRole,
  deleteUserCourseRegistration
} = newActions2;

// For compatibility with existing code (actions helper)
export default {
  ...newActions,
  updateTotalXp,
  updateAssessment,
  ...newActions2,
  updateCourseResearchAgreement,
  updateStoriesUserRole,
  deleteStoriesUserUserGroups
};
