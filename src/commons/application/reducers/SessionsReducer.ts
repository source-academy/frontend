import { createReducer } from '@reduxjs/toolkit';
import { Reducer } from 'redux';
import {
  remoteExecUpdateDevices,
  remoteExecUpdateSession
} from 'src/features/remoteExecution/RemoteExecutionActions';

import { SourceActionType } from '../../utils/ActionsHelper';
import { logOut } from '../actions/CommonsActions';
import {
  removeGitHubOctokitObjectAndAccessToken,
  setAdminPanelCourseRegistrations,
  setAssessmentConfigurations,
  setConfigurableNotificationConfigs,
  setCourseConfiguration,
  setCourseRegistration,
  setGitHubAccessToken,
  setGitHubOctokitObject,
  setGoogleUser,
  setNotificationConfigs,
  setTokens,
  setUser,
  updateAssessment,
  updateAssessmentOverviews,
  updateGrading,
  updateGradingOverviews,
  updateNotifications,
  updateStudents,
  updateTeamFormationOverview,
  updateTeamFormationOverviews,
  updateTotalXp
} from '../actions/SessionActions';
import { defaultSession } from '../ApplicationTypes';
import { SessionState } from '../types/SessionTypes';

export const SessionsReducer: Reducer<SessionState, SourceActionType> = (state, action) => {
  state = newSessionsReducer(state, action);
  return state;
};

const newSessionsReducer = createReducer(defaultSession, builder => {
  builder
    .addCase(logOut, () => {
      return defaultSession;
    })
    .addCase(setGitHubOctokitObject, (state, action) => {
      state.githubOctokitObject = { octokit: action.payload };
    })
    .addCase(setGitHubAccessToken, (state, action) => {
      state.githubAccessToken = action.payload;
    })
    .addCase(setGoogleUser, (state, action) => {
      state.googleUser = action.payload;
    })
    .addCase(setTokens, (state, action) => {
      return { ...state, ...action.payload };
    })
    .addCase(setUser, (state, action) => {
      return { ...state, ...action.payload };
    })
    .addCase(setCourseConfiguration, (state, action) => {
      return { ...state, ...action.payload };
    })
    .addCase(setCourseRegistration, (state, action) => {
      return { ...state, ...action.payload };
    })
    .addCase(setAssessmentConfigurations, (state, action) => {
      state.assessmentConfigurations = action.payload;
    })
    .addCase(setNotificationConfigs, (state, action) => {
      state.notificationConfigs = action.payload;
    })
    .addCase(setConfigurableNotificationConfigs, (state, action) => {
      state.configurableNotificationConfigs = action.payload;
    })
    .addCase(setAdminPanelCourseRegistrations, (state, action) => {
      state.userCourseRegistrations = action.payload;
    })
    .addCase(updateAssessment, (state, action) => {
      const newAssessments = new Map(state.assessments);
      newAssessments.set(action.payload.id, action.payload);
      state.assessments = newAssessments;
    })
    .addCase(updateAssessmentOverviews, (state, action) => {
      state.assessmentOverviews = action.payload;
    })
    .addCase(updateTotalXp, (state, action) => {
      state.xp = action.payload;
    })
    .addCase(updateGrading, (state, action) => {
      const newGradings = new Map(state.gradings);
      newGradings.set(action.payload.submissionId, action.payload.grading);
      state.gradings = newGradings;
    })
    .addCase(updateGradingOverviews, (state, action) => {
      state.gradingOverviews = action.payload;
    })
    .addCase(updateNotifications, (state, action) => {
      state.notifications = action.payload;
    })
    .addCase(updateStudents, (state, action) => {
      state.students = action.payload;
    })
    .addCase(updateTeamFormationOverviews, (state, action) => {
      state.teamFormationOverviews = action.payload;
    })
    .addCase(updateTeamFormationOverview, (state, action) => {
      state.teamFormationOverview = action.payload;
    })
    .addCase(remoteExecUpdateDevices, (state, action) => {
      state.remoteExecutionDevices = action.payload;
    })
    .addCase(remoteExecUpdateSession, (state, action) => {
      state.remoteExecutionSession = action.payload;
    })
    .addCase(removeGitHubOctokitObjectAndAccessToken, (state, action) => {
      state.githubOctokitObject = { octokit: undefined };
      state.githubAccessToken = undefined;
    });
});
