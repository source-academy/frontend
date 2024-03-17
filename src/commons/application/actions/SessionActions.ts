import { createAction } from '@reduxjs/toolkit';
import {
  paginationToBackendParams,
  ungradedToBackendParams
} from 'src/features/grading/GradingUtils';

import { GradingOverviews, GradingQuery } from '../../../features/grading/GradingTypes';
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
import { Role } from '../ApplicationTypes';
import {
  ACKNOWLEDGE_NOTIFICATIONS,
  AdminPanelCourseRegistration,
  CourseRegistration,
  DELETE_ASSESSMENT_CONFIG,
  DELETE_TIME_OPTIONS,
  DELETE_USER_COURSE_REGISTRATION,
  FETCH_ADMIN_PANEL_COURSE_REGISTRATIONS,
  FETCH_ASSESSMENT,
  FETCH_ASSESSMENT_ADMIN,
  FETCH_ASSESSMENT_CONFIGS,
  FETCH_ASSESSMENT_OVERVIEWS,
  FETCH_AUTH,
  FETCH_CONFIGURABLE_NOTIFICATION_CONFIGS,
  FETCH_COURSE_CONFIG,
  FETCH_GRADING,
  FETCH_GRADING_OVERVIEWS,
  FETCH_NOTIFICATION_CONFIGS,
  FETCH_NOTIFICATIONS,
  FETCH_TOTAL_XP,
  FETCH_TOTAL_XP_ADMIN,
  FETCH_USER_AND_COURSE,
  LOGIN,
  LOGIN_GITHUB,
  LOGOUT_GITHUB,
  LOGOUT_GOOGLE,
  NotificationConfiguration,
  NotificationPreference,
  REAUTOGRADE_ANSWER,
  REAUTOGRADE_SUBMISSION,
  REMOVE_GITHUB_OCTOKIT_OBJECT_AND_ACCESS_TOKEN,
  SET_ADMIN_PANEL_COURSE_REGISTRATIONS,
  SET_ASSESSMENT_CONFIGURATIONS,
  SET_CONFIGURABLE_NOTIFICATION_CONFIGS,
  SET_COURSE_CONFIGURATION,
  SET_COURSE_REGISTRATION,
  SET_GITHUB_ACCESS_TOKEN,
  SET_GITHUB_OCTOKIT_OBJECT,
  SET_GOOGLE_USER,
  SET_NOTIFICATION_CONFIGS,
  SET_TOKENS,
  SET_USER,
  SUBMIT_ANSWER,
  SUBMIT_ASSESSMENT,
  SUBMIT_GRADING,
  SUBMIT_GRADING_AND_CONTINUE,
  TimeOption,
  Tokens,
  UNSUBMIT_SUBMISSION,
  UPDATE_ASSESSMENT,
  UPDATE_ASSESSMENT_CONFIGS,
  UPDATE_ASSESSMENT_OVERVIEWS,
  UPDATE_COURSE_CONFIG,
  UPDATE_COURSE_RESEARCH_AGREEMENT,
  UPDATE_GRADING,
  UPDATE_GRADING_OVERVIEWS,
  UPDATE_LATEST_VIEWED_COURSE,
  UPDATE_NOTIFICATION_CONFIG,
  UPDATE_NOTIFICATION_PREFERENCES,
  UPDATE_NOTIFICATIONS,
  UPDATE_TIME_OPTIONS,
  UPDATE_TOTAL_XP,
  UPDATE_USER_ROLE,
  UpdateCourseConfiguration,
  User
} from '../types/SessionTypes';

export const fetchAuth = createAction(FETCH_AUTH, (code: string, providerId?: string) => ({
  payload: { code, providerId }
}));

export const fetchUserAndCourse = createAction(FETCH_USER_AND_COURSE, () => ({ payload: {} }));

export const fetchCourseConfig = createAction(FETCH_COURSE_CONFIG, () => ({ payload: {} }));

export const fetchAssessment = createAction(
  FETCH_ASSESSMENT,
  (assessmentId: number, assessmentPassword?: string) => ({
    payload: { assessmentId, assessmentPassword }
  })
);

export const fetchAssessmentAdmin = createAction(
  FETCH_ASSESSMENT_ADMIN,
  (assessmentId: number, courseRegId: number) => ({ payload: { assessmentId, courseRegId } })
);

export const fetchAssessmentOverviews = createAction(FETCH_ASSESSMENT_OVERVIEWS, () => ({
  payload: {}
}));

export const fetchTotalXp = createAction(FETCH_TOTAL_XP, () => ({ payload: {} }));

export const fetchTotalXpAdmin = createAction(FETCH_TOTAL_XP_ADMIN, (courseRegId: number) => ({
  payload: courseRegId
}));

export const fetchGrading = createAction(FETCH_GRADING, (submissionId: number) => ({
  payload: submissionId
}));

/**
 * @param filterToGroup - param that when set to true, only shows submissions under the group
 * of the grader
 * @param gradedFilter - backend params to filter to ungraded
 * @param pageParams - param that contains offset and pageSize, informing backend about how
 * many entries, starting from what offset, to get
 * @param filterParams - param that contains columnFilters converted into JSON for
 * processing into query parameters
 */
export const fetchGradingOverviews = createAction(
  FETCH_GRADING_OVERVIEWS,
  (
    filterToGroup = true,
    gradedFilter = ungradedToBackendParams(false),
    pageParams = paginationToBackendParams(0, 10),
    filterParams = {}
  ) => ({ payload: { filterToGroup, gradedFilter, pageParams, filterParams } })
);

export const login = createAction(LOGIN, (providerId: string) => ({ payload: providerId }));

export const logoutGoogle = createAction(LOGOUT_GOOGLE, () => ({ payload: {} }));

export const loginGitHub = createAction(LOGIN_GITHUB, () => ({ payload: {} }));

export const logoutGitHub = createAction(LOGOUT_GITHUB, () => ({ payload: {} }));

export const setTokens = createAction(SET_TOKENS, ({ accessToken, refreshToken }: Tokens) => ({
  payload: { accessToken, refreshToken }
}));

export const setUser = createAction(SET_USER, (user: User) => ({ payload: user }));

export const setCourseConfiguration = createAction(
  SET_COURSE_CONFIGURATION,
  (courseConfiguration: UpdateCourseConfiguration) => ({ payload: courseConfiguration })
);

export const setCourseRegistration = createAction(
  SET_COURSE_REGISTRATION,
  (courseRegistration: Partial<CourseRegistration>) => ({ payload: courseRegistration })
);

export const setAssessmentConfigurations = createAction(
  SET_ASSESSMENT_CONFIGURATIONS,
  (assessmentConfigurations: AssessmentConfiguration[]) => ({ payload: assessmentConfigurations })
);

export const setConfigurableNotificationConfigs = createAction(
  SET_CONFIGURABLE_NOTIFICATION_CONFIGS,
  (notificationConfigs: NotificationConfiguration[]) => ({ payload: notificationConfigs })
);

export const setNotificationConfigs = createAction(
  SET_NOTIFICATION_CONFIGS,
  (notificationConfigs: NotificationConfiguration[]) => ({ payload: notificationConfigs })
);

export const setAdminPanelCourseRegistrations = createAction(
  SET_ADMIN_PANEL_COURSE_REGISTRATIONS,
  (courseRegistrations: AdminPanelCourseRegistration[]) => ({ payload: courseRegistrations })
);

export const setGoogleUser = createAction(SET_GOOGLE_USER, (user?: string) => ({ payload: user }));

export const setGitHubOctokitObject = createAction(
  SET_GITHUB_OCTOKIT_OBJECT,
  (authToken?: string) => ({ payload: generateOctokitInstance(authToken || '') })
);

export const setGitHubAccessToken = createAction(SET_GITHUB_ACCESS_TOKEN, (authToken?: string) => ({
  payload: authToken
}));

export const removeGitHubOctokitObjectAndAccessToken = createAction(
  REMOVE_GITHUB_OCTOKIT_OBJECT_AND_ACCESS_TOKEN,
  () => ({ payload: {} })
);

export const submitAnswer = createAction(
  SUBMIT_ANSWER,
  (id: number, answer: string | number | ContestEntry[]) => ({ payload: { id, answer } })
);

export const submitAssessment = createAction(SUBMIT_ASSESSMENT, (id: number) => ({ payload: id }));

export const submitGrading = createAction(
  SUBMIT_GRADING,
  (submissionId: number, questionId: number, xpAdjustment: number = 0, comments?: string) => ({
    payload: { submissionId, questionId, xpAdjustment, comments }
  })
);

export const submitGradingAndContinue = createAction(
  SUBMIT_GRADING_AND_CONTINUE,
  (submissionId: number, questionId: number, xpAdjustment: number = 0, comments?: string) => ({
    payload: { submissionId, questionId, xpAdjustment, comments }
  })
);

export const reautogradeSubmission = createAction(
  REAUTOGRADE_SUBMISSION,
  (submissionId: number) => ({ payload: submissionId })
);

export const reautogradeAnswer = createAction(
  REAUTOGRADE_ANSWER,
  (submissionId: number, questionId: number) => ({ payload: { submissionId, questionId } })
);

export const updateAssessmentOverviews = createAction(
  UPDATE_ASSESSMENT_OVERVIEWS,
  (overviews: AssessmentOverview[]) => ({ payload: overviews })
);

export const updateTotalXp = createAction(UPDATE_TOTAL_XP, (totalXp: number) => ({
  payload: totalXp
}));

export const updateAssessment = createAction(UPDATE_ASSESSMENT, (assessment: Assessment) => ({
  payload: assessment
}));

export const updateGradingOverviews = createAction(
  UPDATE_GRADING_OVERVIEWS,
  (overviews: GradingOverviews) => ({ payload: overviews })
);

/**
 * An extra id parameter is included here because of
 * no id for Grading.
 */
export const updateGrading = createAction(
  UPDATE_GRADING,
  (submissionId: number, grading: GradingQuery) => ({ payload: { submissionId, grading } })
);

export const unsubmitSubmission = createAction(UNSUBMIT_SUBMISSION, (submissionId: number) => ({
  payload: { submissionId }
}));

/**
 * Notification actions
 */

export const fetchNotifications = createAction(FETCH_NOTIFICATIONS, () => ({ payload: {} }));

export const acknowledgeNotifications = createAction(
  ACKNOWLEDGE_NOTIFICATIONS,
  (withFilter?: NotificationFilterFunction) => ({ payload: { withFilter } })
);

export const updateNotifications = createAction(
  UPDATE_NOTIFICATIONS,
  (notifications: Notification[]) => ({ payload: notifications })
);

export const updateLatestViewedCourse = createAction(
  UPDATE_LATEST_VIEWED_COURSE,
  (courseId: number) => ({ payload: { courseId } })
);

export const updateCourseConfig = createAction(
  UPDATE_COURSE_CONFIG,
  (courseConfiguration: UpdateCourseConfiguration) => ({ payload: courseConfiguration })
);

export const fetchAssessmentConfigs = createAction(FETCH_ASSESSMENT_CONFIGS, () => ({
  payload: {}
}));

export const updateAssessmentConfigs = createAction(
  UPDATE_ASSESSMENT_CONFIGS,
  (assessmentConfigs: AssessmentConfiguration[]) => ({ payload: assessmentConfigs })
);

export const updateNotificationConfigs = createAction(
  UPDATE_NOTIFICATION_CONFIG,
  (notificationConfigs: NotificationConfiguration[]) => ({ payload: notificationConfigs })
);

export const updateNotificationPreferences = createAction(
  UPDATE_NOTIFICATION_PREFERENCES,
  (notificationPreferences: NotificationPreference[], courseRegId: number) => ({
    payload: { notificationPreferences, courseRegId }
  })
);

export const deleteAssessmentConfig = createAction(
  DELETE_ASSESSMENT_CONFIG,
  (assessmentConfig: AssessmentConfiguration) => ({ payload: assessmentConfig })
);

export const fetchAdminPanelCourseRegistrations = createAction(
  FETCH_ADMIN_PANEL_COURSE_REGISTRATIONS,
  () => ({ payload: {} })
);

export const fetchConfigurableNotificationConfigs = createAction(
  FETCH_CONFIGURABLE_NOTIFICATION_CONFIGS,
  (courseRegId: number) => ({ payload: { courseRegId } })
);

export const fetchNotificationConfigs = createAction(FETCH_NOTIFICATION_CONFIGS, () => ({
  payload: {}
}));

export const updateTimeOptions = createAction(UPDATE_TIME_OPTIONS, (timeOptions: TimeOption[]) => ({
  payload: timeOptions
}));

export const deleteTimeOptions = createAction(DELETE_TIME_OPTIONS, (timeOptionIds: number[]) => ({
  payload: timeOptionIds
}));

export const updateUserRole = createAction(UPDATE_USER_ROLE, (courseRegId: number, role: Role) => ({
  payload: { courseRegId, role }
}));

export const deleteUserCourseRegistration = createAction(
  DELETE_USER_COURSE_REGISTRATION,
  (courseRegId: number) => ({ payload: { courseRegId } })
);

export const updateCourseResearchAgreement = createAction(
  UPDATE_COURSE_RESEARCH_AGREEMENT,
  (agreedToResearch: boolean) => ({ payload: { agreedToResearch } })
);
