import { Reducer } from 'redux';
import { ActionType } from 'typesafe-actions';

import * as actions from '../actions';
import {
  LOG_OUT,
  SET_GAME_STATE,
  SET_TOKENS,
  SET_USER,
  UPDATE_ASSESSMENT,
  UPDATE_ASSESSMENT_OVERVIEWS,
  UPDATE_GRADING,
  UPDATE_GRADING_OVERVIEWS,
  UPDATE_HISTORY_HELPERS,
  UPDATE_MATERIAL_DIRECTORY_TREE,
  UPDATE_MATERIAL_INDEX,
  UPDATE_NOTIFICATIONS
} from '../actions/actionTypes';
import { defaultSession, ISessionState } from './states';

export const reducer: Reducer<ISessionState> = (
  state = defaultSession,
  action: ActionType<typeof actions>
) => {
  switch (action.type) {
    case LOG_OUT:
      return defaultSession;
    case SET_TOKENS:
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken
      };
    case SET_USER:
      return {
        ...state,
        ...action.payload
      };
    case UPDATE_HISTORY_HELPERS:
      const helper = state.historyHelper;
      const isAcademy = isAcademyRe.exec(action.payload) != null;
      const newAcademyLocations = isAcademy
        ? [helper.lastAcademyLocations[1], action.payload]
        : [...helper.lastAcademyLocations];
      const newGeneralLocations = [helper.lastGeneralLocations[1], action.payload];
      return {
        ...state,
        historyHelper: {
          lastAcademyLocations: newAcademyLocations,
          lastGeneralLocations: newGeneralLocations
        }
      };
    case UPDATE_ASSESSMENT:
      const newAssessments = new Map(state.assessments);
      newAssessments.set(action.payload.id, action.payload);
      return {
        ...state,
        assessments: newAssessments
      };
    case UPDATE_ASSESSMENT_OVERVIEWS:
      return {
        ...state,
        assessmentOverviews: action.payload
      };
    case UPDATE_GRADING:
      const newGradings = new Map(state.gradings);
      newGradings.set(action.payload.submissionId, action.payload.grading);
      return {
        ...state,
        gradings: newGradings
      };
    case UPDATE_GRADING_OVERVIEWS:
      return {
        ...state,
        gradingOverviews: action.payload
      };
    case UPDATE_MATERIAL_DIRECTORY_TREE:
      return {
        ...state,
        materialDirectoryTree: action.payload.directoryTree
      };
    case UPDATE_MATERIAL_INDEX:
      return {
        ...state,
        materialIndex: action.payload.index
      };
    case UPDATE_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload
      };
    case SET_GAME_STATE:
      return {
        ...state,
        gameState: action.payload
      };
    default:
      return state;
  }
};

export const isAcademyRe = new RegExp('^/academy.*', 'i');
