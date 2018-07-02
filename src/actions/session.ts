import { ActionCreator } from 'redux'

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

export const fetchUsername = () => ({
  type: actionTypes.FETCH_USERNAME
})

export const login = () => ({
  type: actionTypes.LOGIN
})

export const setTokens: ActionCreator<actionTypes.IAction> = (
  accessToken: string,
  refreshToken: string
) => ({
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
