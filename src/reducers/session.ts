import { Reducer } from 'redux'

import {
  IAction,
  LOG_OUT,
  SET_TOKENS,
  SET_USER,
  UPDATE_ASSESSMENT,
  UPDATE_ASSESSMENT_OVERVIEW,
  UPDATE_ASSESSMENT_OVERVIEWS,
  UPDATE_GRADING,
  UPDATE_GRADING_OVERVIEWS,
  UPDATE_HISTORY_HELPERS
} from '../actions/actionTypes'
import { defaultSession, ISessionState } from './states'

export const reducer: Reducer<ISessionState> = (state = defaultSession, action: IAction) => {
  switch (action.type) {
    case LOG_OUT:
      return defaultSession
    case SET_TOKENS:
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken
      }
    case SET_USER:
      return {
        ...state,
        ...action.payload
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
    case UPDATE_ASSESSMENT:
      const newAssessments = new Map(state.assessments)
      newAssessments.set(action.payload.id, action.payload)
      return {
        ...state,
        assessments: newAssessments
      }
    case UPDATE_ASSESSMENT_OVERVIEW:
      const newOverviews = Object.assign([], state.assessmentOverviews);
      newOverviews.push(action.payload);
      return {
        ...state,
        assessmentOverviews: newOverviews
      }
    case UPDATE_ASSESSMENT_OVERVIEWS:
      if (state.assessmentOverviews){
        const updatedOverviews = Object.assign([], state.assessmentOverviews);
        const usedIDs = new Set();
        state.assessmentOverviews.forEach((x: any) => {usedIDs.add(x.id)});
        action.payload.forEach((x: any) => {if (!usedIDs.has(x.id)) {updatedOverviews.push(x)}})
        return {
          ...state,
          assessmentOverviews: updatedOverviews
        }
      } else{
        return {
          ...state,
          assessmentOverviews: action.payload
        }
      }
    case UPDATE_GRADING:
      const newGradings = new Map(state.gradings)
      newGradings.set(action.payload.submissionId, action.payload.grading)
      return {
        ...state,
        gradings: newGradings
      }
    case UPDATE_GRADING_OVERVIEWS:
      return {
        ...state,
        gradingOverviews: action.payload
      }
    default:
      return state
  }
}

export const isAcademyRe = new RegExp('^/academy.*', 'i')
