import { ActionCreator } from 'redux'
import * as actionTypes from './actionTypes'

export const changeToken: ActionCreator<actionTypes.IAction> = (token: string) => ({
  type: actionTypes.CHANGE_TOKEN,
  payload: token
})

export const changeUsername: ActionCreator<actionTypes.IAction> = (username: string) => ({
  type: actionTypes.CHANGE_USERNAME,
  payload: username
})

export const fetchAnnouncements = () => ({
  type: actionTypes.FETCH_ANNOUNCEMENTS
})

export const fetchMissionsInfo = () => ({
  type: actionTypes.FETCH_MISSIONS_INFO
})

export const login = () => ({
  type: actionTypes.LOGIN
})

export const startChangeUsername = () => ({
  type: actionTypes.START_CHANGE_USERNAME
})
