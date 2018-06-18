import { Reducer } from 'redux'

import { CHANGE_TOKEN, IAction, SET_USERNAME, UPDATE_HISTORY_HELPERS } from '../actions/actionTypes'
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
    case UPDATE_HISTORY_HELPERS:
      // /^\/academy.*/i
      const helper = state.historyHelper
      const isAcademy = isAcademyRe.exec(action.payload) != null
      const newAcademyLocations = isAcademy
        ? [helper.lastAcademyLocations[1], action.payload]
        : [...helper.lastAcademyLocations]
      const newGeneralLocations = [helper.lastGeneralLocations[1], action.payload]
      // tslint:disable-next-line
      console.log(`src/reducers/sessions.ts: newGeneralLocations == ${newGeneralLocations}`)
      return {
        ...state,
        historyHelper: {
          lastAcademyLocations: newAcademyLocations,
          lastGeneralLocations: newGeneralLocations
        }
      }
    default:
      return state
  }
}

const isAcademyRe = new RegExp('^/academy.*', 'i')
