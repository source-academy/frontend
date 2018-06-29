import { Reducer } from 'redux'

import {
  IAction,
  SET_TOKEN,
  SET_USERNAME,
  UPDATE_ASSESSMENT,
  UPDATE_ASSESSMENT_OVERVIEWS,
  UPDATE_HISTORY_HELPERS
} from '../actions/actionTypes'
import { defaultSession, ISessionState } from './states'

export const reducer: Reducer<ISessionState> = (state = defaultSession, action: IAction) => {
  switch (action.type) {
    case SET_TOKEN:
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
    case UPDATE_ASSESSMENT:
      const newAssessments = new Map(state.assessments)
      newAssessments.set(action.payload.id, action.payload)
      return {
        ...state,
        assessments: newAssessments
      }
    default:
      return state
  }
}

export const isAcademyRe = new RegExp('^/academy.*', 'i')
