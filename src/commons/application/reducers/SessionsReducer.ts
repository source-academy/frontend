import { Reducer } from 'redux';

import {
  REMOTE_EXEC_UPDATE_DEVICES,
  REMOTE_EXEC_UPDATE_SESSION
} from '../../../features/remoteExecution/RemoteExecutionTypes';
import { SourceActionType } from '../../utils/ActionsHelper';
import { generateOctokitInstance } from '../../utils/GitHubPersistenceHelper';
import { defaultSession } from '../ApplicationTypes';
import { LOG_OUT } from '../types/CommonsTypes';
import {
  SessionState,
  SET_GITHUB_OCTOKIT_INSTANCE,
  SET_GITHUB_USER_REPOS,
  SET_GITHUB_USERNAME,
  SET_GOOGLE_USER,
  SET_PICKER_DIALOG,
  SET_TOKENS,
  SET_USER,
  UPDATE_ASSESSMENT,
  UPDATE_ASSESSMENT_OVERVIEWS,
  UPDATE_GRADING,
  UPDATE_GRADING_OVERVIEWS,
  UPDATE_HISTORY_HELPERS,
  UPDATE_NOTIFICATIONS
} from '../types/SessionTypes';

export const SessionsReducer: Reducer<SessionState> = (
  state = defaultSession,
  action: SourceActionType
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
    case SET_PICKER_DIALOG:
      return {
        ...state,
        isPickerOpen: action.payload
      };
    case SET_GITHUB_USER_REPOS:
      return {
        ...state,
        userRepos: action.payload
      };
    case SET_GITHUB_USERNAME:
      console.log('USERNAME IS HERE ==>>' + action.payload);
      return {
        ...state,
        username: action.payload
      };
    case SET_USER:
      return {
        ...state,
        ...action.payload
      };
    case SET_GOOGLE_USER:
      return {
        ...state,
        googleUser: action.payload
      };
    case SET_GITHUB_OCTOKIT_INSTANCE:
      return {
        ...state,
        githubOctokitInstance: generateOctokitInstance(action.payload || '')
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
    case UPDATE_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload
      };
    case REMOTE_EXEC_UPDATE_DEVICES:
      return {
        ...state,
        remoteExecutionDevices: action.payload
      };
    case REMOTE_EXEC_UPDATE_SESSION:
      return {
        ...state,
        remoteExecutionSession: action.payload
      };
    default:
      return state;
  }
};

export const isAcademyRe = new RegExp('^/academy.*', 'i');
