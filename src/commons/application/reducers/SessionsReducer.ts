import { createReducer, Reducer } from '@reduxjs/toolkit';
import RemoteExecutionActions from 'src/features/remoteExecution/RemoteExecutionActions';

import { SourceActionType } from '../../utils/ActionsHelper';
import { logOut } from '../actions/CommonsActions';
import SessionActions from '../actions/SessionActions';
import { defaultSession } from '../ApplicationTypes';
import { SessionState } from '../types/SessionTypes';

export const SessionsReducer: Reducer<SessionState, SourceActionType> = (
  state = defaultSession,
  action
) => {
  state = newSessionsReducer(state, action);
  return state;
};

const newSessionsReducer = createReducer(defaultSession, builder => {
  builder
    .addCase(logOut, () => {
      return defaultSession;
    })
    .addCase(SessionActions.setGitHubOctokitObject, (state, action) => {
      state.githubOctokitObject = { octokit: action.payload };
    })
    .addCase(SessionActions.setGitHubAccessToken, (state, action) => {
      state.githubAccessToken = action.payload;
    })
    .addCase(SessionActions.setGoogleUser, (state, action) => {
      state.googleUser = action.payload;
    })
    .addCase(SessionActions.setTokens, (state, action) => {
      return { ...state, ...action.payload };
    })
    .addCase(SessionActions.setUser, (state, action) => {
      return { ...state, ...action.payload };
    })
    .addCase(SessionActions.setCourseConfiguration, (state, action) => {
      return { ...state, ...action.payload };
    })
    .addCase(SessionActions.setCourseRegistration, (state, action) => {
      return { ...state, ...action.payload };
    })
    .addCase(SessionActions.setAssessmentConfigurations, (state, action) => {
      state.assessmentConfigurations = action.payload;
    })
    .addCase(SessionActions.setAdminPanelCourseRegistrations, (state, action) => {
      state.userCourseRegistrations = action.payload;
    })
    .addCase(SessionActions.updateAssessment, (state, action) => {
      state.assessments[action.payload.id] = action.payload;
    })
    .addCase(SessionActions.updateAssessmentOverviews, (state, action) => {
      state.assessmentOverviews = action.payload;
    })
    .addCase(SessionActions.updateTotalXp, (state, action) => {
      state.xp = action.payload;
    })
    .addCase(SessionActions.updateGrading, (state, action) => {
      state.gradings[action.payload.submissionId] = action.payload.grading;
    })
    .addCase(SessionActions.updateGradingOverviews, (state, action) => {
      state.gradingOverviews = action.payload;
    })
    .addCase(SessionActions.updateNotifications, (state, action) => {
      state.notifications = action.payload;
    })
    .addCase(SessionActions.updateStudents, (state, action) => {
      state.students = action.payload;
    })
    .addCase(SessionActions.updateTeamFormationOverviews, (state, action) => {
      state.teamFormationOverviews = action.payload;
    })
    .addCase(SessionActions.updateTeamFormationOverview, (state, action) => {
      state.teamFormationOverview = action.payload;
    })
    .addCase(RemoteExecutionActions.remoteExecUpdateDevices, (state, action) => {
      state.remoteExecutionDevices = action.payload;
    })
    .addCase(RemoteExecutionActions.remoteExecUpdateSession, (state, action) => {
      state.remoteExecutionSession = action.payload;
    })
    .addCase(SessionActions.removeGitHubOctokitObjectAndAccessToken, (state, action) => {
      state.githubOctokitObject = { octokit: undefined };
      state.githubAccessToken = undefined;
    });
});
