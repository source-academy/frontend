import { ActionCreator } from 'redux'

import { IAssessmentOverview } from '../components/assessment/assessmentShape'
import * as actionTypes from './actionTypes'

export const changeToken: ActionCreator<actionTypes.IAction> = (token: string) => ({
  type: actionTypes.CHANGE_TOKEN,
  payload: token
})

export const fetchAnnouncements = () => ({
  type: actionTypes.FETCH_ANNOUNCEMENTS
})

export const fetchAssessment = (missionId: number) => ({
  type: actionTypes.FETCH_ASSESSMENT,
  payload: missionId
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
