import { Reducer } from 'redux';

import {
  REMOTE_EXEC_UPDATE_DEVICES,
  REMOTE_EXEC_UPDATE_SESSION
} from '../../../features/remoteExecution/RemoteExecutionTypes';
import { SourceActionType } from '../../utils/ActionsHelper';
import { defaultSession } from '../ApplicationTypes';
import { LOG_OUT } from '../types/CommonsTypes';
import {
  REMOVE_GITHUB_OCTOKIT_OBJECT_AND_ACCESS_TOKEN,
  SessionState,
  SET_ADMIN_PANEL_COURSE_REGISTRATIONS,
  SET_ASSESSMENT_CONFIGURATIONS,
  SET_COURSE_CONFIGURATION,
  SET_COURSE_REGISTRATION,
  SET_GITHUB_ACCESS_TOKEN,
  SET_GITHUB_ASSESSMENT,
  SET_GITHUB_OCTOKIT_OBJECT,
  SET_GOOGLE_USER,
  SET_TOKENS,
  SET_USER,
  UPDATE_ALL_USER_XP,
  UPDATE_ASSESSMENT,
  UPDATE_ASSESSMENT_OVERVIEWS,
  UPDATE_GRADING,
  UPDATE_GRADING_OVERVIEWS,
  UPDATE_NOTIFICATIONS,
  UPDATE_TOTAL_XP
} from '../types/SessionTypes';

export const SessionsReducer: Reducer<SessionState> = (
  state = defaultSession,
  action: SourceActionType
) => {
  switch (action.type) {
    case LOG_OUT:
      return defaultSession;
    case SET_GITHUB_ASSESSMENT:
      return {
        ...state,
        githubAssessment: action.payload
      };
    case SET_GITHUB_OCTOKIT_OBJECT:
      return {
        ...state,
        githubOctokitObject: { octokit: action.payload }
      };
    case SET_GITHUB_ACCESS_TOKEN:
      return {
        ...state,
        githubAccessToken: action.payload
      };
    case SET_GOOGLE_USER:
      return {
        ...state,
        googleUser: action.payload
      };
    case SET_TOKENS:
      return {
        ...state,
        ...action.payload
      };
    case SET_USER:
      return {
        ...state,
        ...action.payload
      };
    case SET_COURSE_CONFIGURATION:
      return {
        ...state,
        ...action.payload
      };
    case SET_COURSE_REGISTRATION:
      return {
        ...state,
        ...action.payload
      };
    case SET_ASSESSMENT_CONFIGURATIONS:
      return {
        ...state,
        assessmentConfigurations: action.payload
      };
    case SET_ADMIN_PANEL_COURSE_REGISTRATIONS:
      return {
        ...state,
        userCourseRegistrations: action.payload
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
    case UPDATE_TOTAL_XP:
      return { ...state, xp: action.payload };
    case UPDATE_ALL_USER_XP:
      return { ...state, allUserXp: action.payload };
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
    case REMOVE_GITHUB_OCTOKIT_OBJECT_AND_ACCESS_TOKEN:
      return {
        ...state,
        githubOctokitObject: { octokit: undefined },
        githubAccessToken: undefined
      };
    default:
      return state;
  }
};
