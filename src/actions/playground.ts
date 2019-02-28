import { ActionCreator } from 'redux'

import * as actionTypes from './actionTypes'

export const generateLzString = () => ({
  type: actionTypes.GENERATE_LZ_STRING
})

export const changeQueryString: ActionCreator<actionTypes.IAction> = (queryString: string) => ({
  type: actionTypes.CHANGE_QUERY_STRING,
  payload: queryString
})

export const oauthCallback = () => ({
  type: actionTypes.OAUTH_CALLBACK
})

export const openPicker = () => ({
  type: actionTypes.OPEN_PICKER
})

export const updateStorageTokens: ActionCreator<actionTypes.IAction> = (
  token: string,
  expiresAt: string
) => ({
  type: actionTypes.UPDATE_STORAGE_TOKENS,
  payload: {
    token,
    expiresAt
  }
})
