import { ActionCreator } from 'redux'

import * as actionTypes from './actionTypes'

export const generateLzString = () => ({
  type: actionTypes.GENERATE_LZ_STRING
})

export const changeQueryString: ActionCreator<actionTypes.IAction> = (queryString: string) => ({
  type: actionTypes.CHANGE_QUERY_STRING,
  payload: queryString
})

export const handleAccessToken = (accessToken: string) => ({
  type: actionTypes.HANDLE_ACCESS_TOKEN,
  payload: accessToken
})

export const openPicker = () => ({
  type: actionTypes.OPEN_PICKER
})

export const savePicker = () => ({
  type: actionTypes.SAVE_TO_DRIVE
})
