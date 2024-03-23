import { createReducer } from '@reduxjs/toolkit';
import { Reducer } from 'redux';
import { SourceActionType } from 'src/commons/utils/ActionsHelper';

import { defaultAchievement } from '../../commons/application/ApplicationTypes';
import {
  saveAchievements,
  saveGoals,
  saveUserAssessmentOverviews,
  saveUsers
} from './AchievementActions';
import { AchievementState } from './AchievementTypes';

export const AchievementReducer: Reducer<AchievementState, SourceActionType> = createReducer(
  defaultAchievement,
  builder => {
    builder
      .addCase(saveAchievements, (state, action) => {
        state.achievements = action.payload;
      })
      .addCase(saveGoals, (state, action) => {
        state.goals = action.payload;
      })
      .addCase(saveUsers, (state, action) => {
        state.users = action.payload;
      })
      .addCase(saveUserAssessmentOverviews, (state, action) => {
        state.assessmentOverviews = action.payload;
      });
  }
);
