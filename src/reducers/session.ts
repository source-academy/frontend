import { Reducer } from 'redux'

import {
  CHANGE_TOKEN,
  IAction,
  SET_USERNAME,
  UPDATE_ASSESSMENT_OVERVIEWS,
  UPDATE_HISTORY_HELPERS
} from '../actions/actionTypes'
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
      const helper = state.historyHelper
      const isAcademy = isAcademyRe.exec(action.payload) != null
      const newAcademyLocations = isAcademy
        ? [helper.lastAcademyLocations[1], action.payload]
        : [...helper.lastAcademyLocations]
      const newGeneralLocations = [helper.lastGeneralLocations[1], action.payload]
      return {
        ...state,
        historyHelper: {
          lastAcademyLocations: newAcademyLocations,
          lastGeneralLocations: newGeneralLocations
        }
      }
    case UPDATE_ASSESSMENT_OVERVIEWS:
      return {
        ...state,
        assessmentOverviews: action.payload
      }
    default:
      return state
  }
}

export const isAcademyRe = new RegExp('^/academy.*', 'i')
