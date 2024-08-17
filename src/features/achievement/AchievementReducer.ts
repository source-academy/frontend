import { createReducer, Reducer } from '@reduxjs/toolkit';
import { SourceActionType } from 'src/commons/utils/ActionsHelper';

import { defaultAchievement } from '../../commons/application/ApplicationTypes';
import AchievementActions from './AchievementActions';
import { AchievementState } from './AchievementTypes';

export const AchievementReducer: Reducer<AchievementState, SourceActionType> = createReducer(
  defaultAchievement,
  builder => {
    builder
      .addCase(AchievementActions.saveAchievements, (state, action) => {
        state.achievements = action.payload;
      })
      .addCase(AchievementActions.saveGoals, (state, action) => {
        state.goals = action.payload;
      })
      .addCase(AchievementActions.saveUsers, (state, action) => {
        state.users = action.payload;
      })
      .addCase(AchievementActions.saveUserAssessmentOverviews, (state, action) => {
        state.assessmentOverviews = action.payload;
      });
  }
);
