import { action } from 'typesafe-actions'; // EDITED

import { Grading, GradingOverview } from '../../../features/grading/GradingTypes';
import { Assessment, AssessmentOverview } from '../../assessment/AssessmentTypes';
import {
  Notification,
  NotificationFilterFunction
} from '../../notificationBadge/NotificationBadgeTypes';
import { GameState, Role, Story } from '../ApplicationTypes';
import * as actionTypes from '../types/ActionTypes';
import {
  ACKNOWLEDGE_NOTIFICATIONS,
  FETCH_ASSESSMENT,
  FETCH_ASSESSMENT_OVERVIEWS,
  FETCH_AUTH,
  FETCH_GRADING,
  FETCH_GRADING_OVERVIEWS,
  FETCH_NOTIFICATIONS,
  LOGIN,
  LOGOUT_GOOGLE,
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
  UPDATE_NOTIFICATIONS
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

export const setGameState = (gameState: GameState) => action(actionTypes.SET_GAME_STATE, gameState);

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

export const setUser = (user: {
  name: string;
  role: Role;
  group: string | null;
  grade: number;
  story?: Story;
  gameState?: GameState;
}) => action(SET_USER, user);

export const setGoogleUser = (user?: string) => action(SET_GOOGLE_USER, user);

export const submitAnswer = (id: number, answer: string | number) =>
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
