import { action } from 'typesafe-actions'; // EDITED

import { MissionRepoData } from '../../../commons/githubAssessments/GitHubMissionTypes';
import { Grading, GradingOverview } from '../../../features/grading/GradingTypes';
import { Assessment, AssessmentOverview, ContestEntry } from '../../assessment/AssessmentTypes';
import {
  Notification,
  NotificationFilterFunction
} from '../../notificationBadge/NotificationBadgeTypes';
import { generateOctokitInstance } from '../../utils/GitHubPersistenceHelper';
import {
  ACKNOWLEDGE_NOTIFICATIONS,
  FETCH_ASSESSMENT,
  FETCH_ASSESSMENT_OVERVIEWS,
  FETCH_AUTH,
  FETCH_GRADING,
  FETCH_GRADING_OVERVIEWS,
  FETCH_NOTIFICATIONS,
  LOGIN,
  LOGIN_GITHUB,
  LOGOUT_GITHUB,
  LOGOUT_GOOGLE,
  REAUTOGRADE_ANSWER,
  REAUTOGRADE_SUBMISSION,
  REMOVE_GITHUB_OCTOKIT_OBJECT_AND_ACCESS_TOKEN,
  SET_GITHUB_ACCESS_TOKEN,
  SET_GITHUB_ASSESSMENT,
  SET_GITHUB_OCTOKIT_OBJECT,
  SET_GOOGLE_USER,
  SET_TOKENS,
  SET_USER,
  SUBMIT_ANSWER,
  SUBMIT_ASSESSMENT,
  SUBMIT_GRADING,
  SUBMIT_GRADING_AND_CONTINUE,
  UNSUBMIT_SUBMISSION,
  UPDATE_ASSESSMENT,
  UPDATE_ASSESSMENT_OVERVIEWS,
  UPDATE_GRADING,
  UPDATE_GRADING_OVERVIEWS,
  UPDATE_HISTORY_HELPERS,
  UPDATE_NOTIFICATIONS,
  User
} from '../types/SessionTypes';

export const fetchAuth = (code: string, providerId?: string) =>
  action(FETCH_AUTH, { code, providerId });

export const fetchAssessment = (id: number) => action(FETCH_ASSESSMENT, id);

export const fetchAssessmentOverviews = () => action(FETCH_ASSESSMENT_OVERVIEWS);

export const fetchGrading = (submissionId: number) => action(FETCH_GRADING, submissionId);

/**
 * @param filterToGroup - param when set to true, only shows submissions under the group
 * of the grader
 */
export const fetchGradingOverviews = (filterToGroup = true) =>
  action(FETCH_GRADING_OVERVIEWS, filterToGroup);

export const login = (providerId: string) => action(LOGIN, providerId);

export const logoutGoogle = () => action(LOGOUT_GOOGLE);

export const loginGitHub = () => action(LOGIN_GITHUB);

export const logoutGitHub = () => action(LOGOUT_GITHUB);

export const setTokens = ({
  accessToken,
  refreshToken
}: {
  accessToken: string;
  refreshToken: string;
}) =>
  action(SET_TOKENS, {
    accessToken,
    refreshToken
  });

export const setUser = (user: User) => action(SET_USER, user);

export const setGoogleUser = (user?: string) => action(SET_GOOGLE_USER, user);

export const setGitHubAssessment = (missionRepoData: MissionRepoData) =>
  action(SET_GITHUB_ASSESSMENT, missionRepoData);

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
  gradeAdjustment: number = 0,
  xpAdjustment: number = 0,
  comments?: string
) =>
  action(SUBMIT_GRADING, {
    submissionId,
    questionId,
    gradeAdjustment,
    xpAdjustment,
    comments
  });

export const submitGradingAndContinue = (
  submissionId: number,
  questionId: number,
  gradeAdjustment: number = 0,
  xpAdjustment: number = 0,
  comments?: string
) =>
  action(SUBMIT_GRADING_AND_CONTINUE, {
    submissionId,
    questionId,
    gradeAdjustment,
    xpAdjustment,
    comments
  });

export const reautogradeSubmission = (submissionId: number) =>
  action(REAUTOGRADE_SUBMISSION, submissionId);

export const reautogradeAnswer = (submissionId: number, questionId: number) =>
  action(REAUTOGRADE_ANSWER, { submissionId, questionId });

export const updateHistoryHelpers = (loc: string) => action(UPDATE_HISTORY_HELPERS, loc);

export const updateAssessmentOverviews = (overviews: AssessmentOverview[]) =>
  action(UPDATE_ASSESSMENT_OVERVIEWS, overviews);

export const updateAssessment = (assessment: Assessment) => action(UPDATE_ASSESSMENT, assessment);

export const updateGradingOverviews = (overviews: GradingOverview[]) =>
  action(UPDATE_GRADING_OVERVIEWS, overviews);

/**
 * An extra id parameter is included here because of
 * no id for Grading.
 */
export const updateGrading = (submissionId: number, grading: Grading) =>
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
