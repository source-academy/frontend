import { Reducer } from 'redux'

import { CHANGE_TOKEN, IAction, SET_USERNAME } from '../actions/actionTypes'
import { defaultSession, ISessionState } from './states'

export const reducer: Reducer<ISessionState> = (state = defaultSession, action: IAction) => {
  switch (action.type) {
    case CHANGE_TOKEN:
      return {
        ...state,
        token: action.payload
      }
    case SET_USERNAME:
      return {
        ...state,
        username: action.payload
      }
    default:
      return state
  }
}
