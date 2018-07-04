import { ActionCreator } from 'redux'

import { Grading, GradingOverview } from '../components/academy/grading/gradingShape'
import { IAssessment, IAssessmentOverview } from '../components/assessment/assessmentShape'
import * as actionTypes from './actionTypes'

export const fetchTokens: ActionCreator<actionTypes.IAction> = (ivleToken: string) => ({
  type: actionTypes.FETCH_TOKENS,
  payload: ivleToken
})

export const fetchAnnouncements = () => ({
  type: actionTypes.FETCH_ANNOUNCEMENTS
})

export const fetchAssessment = (id: number) => ({
  type: actionTypes.FETCH_ASSESSMENT,
  payload: id
})

export const fetchAssessmentOverviews = () => ({
  type: actionTypes.FETCH_ASSESSMENT_OVERVIEWS
})

export const fetchGrading = (submissionId: number) => ({
  type: actionTypes.FETCH_GRADING,
  payload: submissionId
})

export const fetchGradingOverviews = () => ({
  type: actionTypes.FETCH_GRADING_OVERVIEWS
})

export const fetchUsername = () => ({
  type: actionTypes.FETCH_USERNAME
})

export const login = () => ({
  type: actionTypes.LOGIN
})

export const setTokens: ActionCreator<actionTypes.IAction> = ({
  accessToken,
  refreshToken
}) => ({
  type: actionTypes.SET_TOKENS,
  payload: {
    accessToken,
    refreshToken
  }
})

export const setUsername: ActionCreator<actionTypes.IAction> = (username: string) => ({
  type: actionTypes.SET_USERNAME,
  payload: username
})

export const updateHistoryHelpers: ActionCreator<actionTypes.IAction> = (loc: string) => ({
  type: actionTypes.UPDATE_HISTORY_HELPERS,
  payload: loc
})

export const updateAssessmentOverviews = (overviews: IAssessmentOverview[]) => ({
  type: actionTypes.UPDATE_ASSESSMENT_OVERVIEWS,
  payload: overviews
})

export const updateAssessment = (assessment: IAssessment) => ({
  type: actionTypes.UPDATE_ASSESSMENT,
  payload: assessment
})

export const updateGradingOverviews = (overviews: GradingOverview[]) => ({
  type: actionTypes.UPDATE_GRADING_OVERVIEWS,
  payload: overviews
})

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
})
