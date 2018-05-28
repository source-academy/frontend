import { ActionCreator } from 'redux'
import * as actionTypes from './actionTypes'

export const changeToken: ActionCreator<actionTypes.IAction> = (newToken: string) => ({
  type: actionTypes.CHANGE_TOKEN,
  payload: newToken
})
