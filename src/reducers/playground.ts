import { Reducer } from 'redux'

import { CHANGE_QUERY_STRING, IAction, UPDATE_STORAGE_TOKENS } from '../actions/actionTypes'
import { defaultPlayground, IPlaygroundState } from './states'

export const reducer: Reducer<IPlaygroundState> = (state = defaultPlayground, action: IAction) => {
  switch (action.type) {
    case CHANGE_QUERY_STRING:
      return {
        ...state,
        queryString: action.payload
      }
    case UPDATE_STORAGE_TOKENS:
      return {
        ...state,
        storageToken: action.payload.token,
        storageTokenExpiresAt: action.payload.expiresAt
      }
    default:
      return state
  }
}
