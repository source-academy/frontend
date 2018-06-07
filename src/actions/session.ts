import { ActionCreator } from 'redux'
import * as actionTypes from './actionTypes'

export const changeToken: ActionCreator<actionTypes.IAction> = (token: string) => ({
  type: actionTypes.CHANGE_TOKEN,
  payload: token
})

export const fetchAnnouncements = () => ({
  type: actionTypes.FETCH_ANNOUNCEMENTS
})

export const fetchAssessment = () => ({
  type: actionTypes.FETCH_ASSESSMENT
  // TODO payload of mission UID
})

export const fetchMissionsInfo = () => ({
  type: actionTypes.FETCH_MISSIONS_INFO
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
