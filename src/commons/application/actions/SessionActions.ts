import {
  paginationToBackendParams,
  ungradedToBackendParams
} from 'src/features/grading/GradingUtils';
import { action } from 'typesafe-actions'; // EDITED

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

export const fetchAuth = (code: string, providerId?: string) =>
  action(FETCH_AUTH, { code, providerId });

export const fetchUserAndCourse = () => action(FETCH_USER_AND_COURSE);

export const fetchCourseConfig = () => action(FETCH_COURSE_CONFIG);

export const fetchAssessment = (assessmentId: number, assessmentPassword?: string) =>
  action(FETCH_ASSESSMENT, { assessmentId, assessmentPassword });

export const fetchAssessmentAdmin = (assessmentId: number, courseRegId: number) =>
  action(FETCH_ASSESSMENT_ADMIN, { assessmentId, courseRegId });

export const fetchAssessmentOverviews = () => action(FETCH_ASSESSMENT_OVERVIEWS);

export const fetchTotalXp = () => action(FETCH_TOTAL_XP);

export const fetchTotalXpAdmin = (courseRegId: number) => action(FETCH_TOTAL_XP_ADMIN, courseRegId);

export const fetchGrading = (submissionId: number) => action(FETCH_GRADING, submissionId);

/**
 * @param filterToGroup - param that when set to true, only shows submissions under the group
 * of the grader
 * @param gradedFilter - backend params to filter to ungraded
 * @param pageParams - param that contains offset and pageSize, informing backend about how
 * many entries, starting from what offset, to get
 * @param filterParams - param that contains columnFilters converted into JSON for
 * processing into query parameters
 */
export const fetchGradingOverviews = (
  filterToGroup = true,
  gradedFilter = ungradedToBackendParams(false),
  pageParams = paginationToBackendParams(0, 10),
  filterParams = {}
) => action(FETCH_GRADING_OVERVIEWS, { filterToGroup, gradedFilter, pageParams, filterParams });

export const login = (providerId: string) => action(LOGIN, providerId);

export const logoutGoogle = () => action(LOGOUT_GOOGLE);

export const loginGitHub = () => action(LOGIN_GITHUB);

export const logoutGitHub = () => action(LOGOUT_GITHUB);

export const setTokens = ({ accessToken, refreshToken }: Tokens) =>
  action(SET_TOKENS, {
    accessToken,
    refreshToken
  });

export const setUser = (user: User) => action(SET_USER, user);

export const setCourseConfiguration = (courseConfiguration: UpdateCourseConfiguration) =>
  action(SET_COURSE_CONFIGURATION, courseConfiguration);

export const setCourseRegistration = (courseRegistration: Partial<CourseRegistration>) =>
  action(SET_COURSE_REGISTRATION, courseRegistration);

export const setAssessmentConfigurations = (assessmentConfigurations: AssessmentConfiguration[]) =>
  action(SET_ASSESSMENT_CONFIGURATIONS, assessmentConfigurations);

export const setConfigurableNotificationConfigs = (
  notificationConfigs: NotificationConfiguration[]
) => action(SET_CONFIGURABLE_NOTIFICATION_CONFIGS, notificationConfigs);

export const setNotificationConfigs = (notificationConfigs: NotificationConfiguration[]) =>
  action(SET_NOTIFICATION_CONFIGS, notificationConfigs);

export const setAdminPanelCourseRegistrations = (
  courseRegistrations: AdminPanelCourseRegistration[]
) => action(SET_ADMIN_PANEL_COURSE_REGISTRATIONS, courseRegistrations);

export const setGoogleUser = (user?: string) => action(SET_GOOGLE_USER, user);

export const setGitHubOctokitObject = (authToken?: string) =>
  action(SET_GITHUB_OCTOKIT_OBJECT, generateOctokitInstance(authToken || ''));

export const setGitHubAccessToken = (authToken?: string) =>
  action(SET_GITHUB_ACCESS_TOKEN, authToken);

export const removeGitHubOctokitObjectAndAccessToken = () =>
  action(REMOVE_GITHUB_OCTOKIT_OBJECT_AND_ACCESS_TOKEN);

export const submitAnswer = (id: number, answer: string | number | ContestEntry[]) =>
  action(SUBMIT_ANSWER, {
    id,
    answer
  });

export const submitAssessment = (id: number) => action(SUBMIT_ASSESSMENT, id);

export const submitGrading = (
  submissionId: number,
  questionId: number,
  xpAdjustment: number = 0,
  comments?: string
) =>
  action(SUBMIT_GRADING, {
    submissionId,
    questionId,
    xpAdjustment,
    comments
  });

export const submitGradingAndContinue = (
  submissionId: number,
  questionId: number,
  xpAdjustment: number = 0,
  comments?: string
) =>
  action(SUBMIT_GRADING_AND_CONTINUE, {
    submissionId,
    questionId,
    xpAdjustment,
    comments
  });

export const reautogradeSubmission = (submissionId: number) =>
  action(REAUTOGRADE_SUBMISSION, submissionId);

export const reautogradeAnswer = (submissionId: number, questionId: number) =>
  action(REAUTOGRADE_ANSWER, { submissionId, questionId });

export const updateAssessmentOverviews = (overviews: AssessmentOverview[]) =>
  action(UPDATE_ASSESSMENT_OVERVIEWS, overviews);

export const updateTotalXp = (totalXp: number) => action(UPDATE_TOTAL_XP, totalXp);

export const updateAssessment = (assessment: Assessment) => action(UPDATE_ASSESSMENT, assessment);

export const updateGradingOverviews = (overviews: GradingOverviews) =>
  action(UPDATE_GRADING_OVERVIEWS, overviews);

/**
 * An extra id parameter is included here because of
 * no id for Grading.
 */
export const updateGrading = (submissionId: number, grading: GradingQuery) =>
  action(UPDATE_GRADING, {
    submissionId,
    grading
  });

export const unsubmitSubmission = (submissionId: number) =>
  action(UNSUBMIT_SUBMISSION, {
    submissionId
  });

/**
 * Notification actions
 */

export const fetchNotifications = () => action(FETCH_NOTIFICATIONS);

export const acknowledgeNotifications = (withFilter?: NotificationFilterFunction) =>
  action(ACKNOWLEDGE_NOTIFICATIONS, {
    withFilter
  });

export const updateNotifications = (notifications: Notification[]) =>
  action(UPDATE_NOTIFICATIONS, notifications);

export const updateLatestViewedCourse = (courseId: number) =>
  action(UPDATE_LATEST_VIEWED_COURSE, { courseId });

export const updateCourseConfig = (courseConfiguration: UpdateCourseConfiguration) =>
  action(UPDATE_COURSE_CONFIG, courseConfiguration);

export const fetchAssessmentConfigs = () => action(FETCH_ASSESSMENT_CONFIGS);

export const updateAssessmentConfigs = (assessmentConfigs: AssessmentConfiguration[]) =>
  action(UPDATE_ASSESSMENT_CONFIGS, assessmentConfigs);

export const updateNotificationConfigs = (notificationConfigs: NotificationConfiguration[]) =>
  action(UPDATE_NOTIFICATION_CONFIG, notificationConfigs);

export const updateNotificationPreferences = (
  notificationPreferences: NotificationPreference[],
  courseRegId: number
) =>
  action(UPDATE_NOTIFICATION_PREFERENCES, {
    notificationPreferences,
    courseRegId
  });

export const deleteAssessmentConfig = (assessmentConfig: AssessmentConfiguration) =>
  action(DELETE_ASSESSMENT_CONFIG, assessmentConfig);

export const fetchAdminPanelCourseRegistrations = () =>
  action(FETCH_ADMIN_PANEL_COURSE_REGISTRATIONS);

export const fetchConfigurableNotificationConfigs = (courseRegId: number) =>
  action(FETCH_CONFIGURABLE_NOTIFICATION_CONFIGS, { courseRegId });

export const fetchNotificationConfigs = () => action(FETCH_NOTIFICATION_CONFIGS);

export const updateTimeOptions = (timeOptions: TimeOption[]) =>
  action(UPDATE_TIME_OPTIONS, timeOptions);

export const deleteTimeOptions = (timeOptionIds: number[]) =>
  action(DELETE_TIME_OPTIONS, timeOptionIds);

export const updateUserRole = (courseRegId: number, role: Role) =>
  action(UPDATE_USER_ROLE, { courseRegId, role });

export const deleteUserCourseRegistration = (courseRegId: number) =>
  action(DELETE_USER_COURSE_REGISTRATION, { courseRegId });

export const updateCourseResearchAgreement = (agreedToResearch: boolean) =>
  action(UPDATE_COURSE_RESEARCH_AGREEMENT, { agreedToResearch });
