import { action } from 'typesafe-actions';

import { Grading, GradingOverview } from '../components/academy/grading/gradingShape';
import { IAssessment, IAssessmentOverview } from '../components/assessment/assessmentShape';
import {
  Notification,
  NotificationFilterFunction
} from '../components/notification/notificationShape';
import { GameState, Story } from '../reducers/states';
import * as actionTypes from './actionTypes';

import { Role } from '../reducers/states';

export const fetchAuth = (luminusCode: string) => action(actionTypes.FETCH_AUTH, luminusCode);

export const fetchAnnouncements = () => action(actionTypes.FETCH_ANNOUNCEMENTS);

export const fetchAssessment = (id: number) => action(actionTypes.FETCH_ASSESSMENT, id);

export const fetchAssessmentOverviews = () => action(actionTypes.FETCH_ASSESSMENT_OVERVIEWS);

export const fetchGrading = (submissionId: number) =>
  action(actionTypes.FETCH_GRADING, submissionId);

/**
 * @param filterToGroup - param when set to true, only shows submissions under the group
 * of the grader
 */
export const fetchGradingOverviews = (filterToGroup = true) =>
  action(actionTypes.FETCH_GRADING_OVERVIEWS, filterToGroup);

export const login = () => action(actionTypes.LOGIN);

export const setGameState = (gameState: GameState) => action(actionTypes.SET_GAME_STATE, gameState);

export const setTokens = ({
  accessToken,
  refreshToken
}: {
  accessToken: string;
  refreshToken: string;
}) =>
  action(actionTypes.SET_TOKENS, {
    accessToken,
    refreshToken
  });

export const setUser = (user: {
  name: string;
  role: Role;
  grade: number;
  story?: Story;
  gameState?: GameState;
}) => action(actionTypes.SET_USER, user);

export const submitAnswer = (id: number, answer: string | number) =>
  action(actionTypes.SUBMIT_ANSWER, {
    id,
    answer
  });

export const submitAssessment = (id: number) => action(actionTypes.SUBMIT_ASSESSMENT, id);

export const submitGrading = (
  submissionId: number,
  questionId: number,
  gradeAdjustment: number = 0,
  xpAdjustment: number = 0,
  comments?: string
) =>
  action(actionTypes.SUBMIT_GRADING, {
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
  action(actionTypes.SUBMIT_GRADING_AND_CONTINUE, {
    submissionId,
    questionId,
    gradeAdjustment,
    xpAdjustment,
    comments
  });

export const updateHistoryHelpers = (loc: string) =>
  action(actionTypes.UPDATE_HISTORY_HELPERS, loc);

export const updateAssessmentOverviews = (overviews: IAssessmentOverview[]) =>
  action(actionTypes.UPDATE_ASSESSMENT_OVERVIEWS, overviews);

export const updateAssessment = (assessment: IAssessment) =>
  action(actionTypes.UPDATE_ASSESSMENT, assessment);

export const updateGradingOverviews = (overviews: GradingOverview[]) =>
  action(actionTypes.UPDATE_GRADING_OVERVIEWS, overviews);

/**
 * An extra id parameter is included here because of
 * no id for Grading.
 */
export const updateGrading = (submissionId: number, grading: Grading) =>
  action(actionTypes.UPDATE_GRADING, {
    submissionId,
    grading
  });

export const unsubmitSubmission = (submissionId: number) =>
  action(actionTypes.UNSUBMIT_SUBMISSION, {
    submissionId
  });

/**
 * Notification actions
 */

export const fetchNotifications = () => action(actionTypes.FETCH_NOTIFICATIONS);

export const acknowledgeNotifications = (withFilter?: NotificationFilterFunction) =>
  action(actionTypes.ACKNOWLEDGE_NOTIFICATIONS, {
    withFilter
  });

export const updateNotifications = (notifications: Notification[]) =>
  action(actionTypes.UPDATE_NOTIFICATIONS, notifications);

export const notifyChatUsers = (assessmentId?: number, submissionId?: number) =>
  action(actionTypes.NOTIFY_CHATKIT_USERS, {
    assessmentId,
    submissionId
  });
