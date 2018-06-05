import { ActionCreator } from 'redux'
import * as actionTypes from './actionTypes'

export const changeToken: ActionCreator<actionTypes.IAction> = (newToken: string) => ({
  type: actionTypes.CHANGE_TOKEN,
  payload: newToken
})

export const fetchAnnouncements = () => ({
  type: actionTypes.FETCH_ANNOUNCEMENTS
})

export const fetchMissionsInfo = () => ({
  type: actionTypes.FETCH_MISSIONS_INFO
})
