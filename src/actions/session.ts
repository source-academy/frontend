import { ActionCreator } from 'redux';

import { Grading, GradingOverview } from '../components/academy/grading/gradingShape';
import { IAssessment, IAssessmentOverview } from '../components/assessment/assessmentShape';
import { Story } from '../reducers/states';
import * as actionTypes from './actionTypes';

import { Role } from '../reducers/states';

export const fetchAuth: ActionCreator<actionTypes.IAction> = (ivleToken: string) => ({
  type: actionTypes.FETCH_AUTH,
  payload: ivleToken
});

export const fetchAnnouncements = () => ({
  type: actionTypes.FETCH_ANNOUNCEMENTS
});

export const fetchAssessment = (id: number) => ({
  type: actionTypes.FETCH_ASSESSMENT,
  payload: id
});

export const fetchAssessmentOverviews = () => ({
  type: actionTypes.FETCH_ASSESSMENT_OVERVIEWS
});

export const fetchGrading = (submissionId: number) => ({
  type: actionTypes.FETCH_GRADING,
  payload: submissionId
});

/**
 * @param filterToGroup - param when set to true, only shows submissions under the group
 * of the grader
 */
export const fetchGradingOverviews = (filterToGroup = true) => ({
  type: actionTypes.FETCH_GRADING_OVERVIEWS,
  payload: filterToGroup
});

export const login = () => ({
  type: actionTypes.LOGIN
});

export const setTokens: ActionCreator<actionTypes.IAction> = ({ accessToken, refreshToken }) => ({
  type: actionTypes.SET_TOKENS,
  payload: {
    accessToken,
    refreshToken
  }
});

export const setUser: ActionCreator<actionTypes.IAction> = (user: {
  name: string;
  role: Role;
  grade: number;
  story: Story;
}) => ({
  type: actionTypes.SET_USER,
  payload: user
});

export const submitAnswer: ActionCreator<actionTypes.IAction> = (
  id: number,
  answer: string | number
) => ({
  type: actionTypes.SUBMIT_ANSWER,
  payload: {
    id,
    answer
  }
});

export const submitAssessment: ActionCreator<actionTypes.IAction> = (id: number) => ({
  type: actionTypes.SUBMIT_ASSESSMENT,
  payload: id
});

export const submitGrading: ActionCreator<actionTypes.IAction> = (
  submissionId: number,
  questionId: number,
  comment: string,
  gradeAdjustment: number = 0,
  xpAdjustment: number = 0
) => ({
  type: actionTypes.SUBMIT_GRADING,
  payload: {
    submissionId,
    questionId,
    comment,
    gradeAdjustment,
    xpAdjustment
  }
});

export const updateHistoryHelpers: ActionCreator<actionTypes.IAction> = (loc: string) => ({
  type: actionTypes.UPDATE_HISTORY_HELPERS,
  payload: loc
});

export const updateAssessmentOverviews = (overviews: IAssessmentOverview[]) => ({
  type: actionTypes.UPDATE_ASSESSMENT_OVERVIEWS,
  payload: overviews
});

export const updateAssessment = (assessment: IAssessment) => ({
  type: actionTypes.UPDATE_ASSESSMENT,
  payload: assessment
});

export const updateGradingOverviews = (overviews: GradingOverview[]) => ({
  type: actionTypes.UPDATE_GRADING_OVERVIEWS,
  payload: overviews
});

/**
 * An extra id parameter is included here because of
 * no id for Grading.
 */
export const updateGrading = (submissionId: number, grading: Grading) => ({
  type: actionTypes.UPDATE_GRADING,
  payload: {
    submissionId,
    grading
  }
});
