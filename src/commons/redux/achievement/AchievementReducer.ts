import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AssessmentOverview } from 'src/commons/assessment/AssessmentTypes';

import {
  AchievementGoal,
  AchievementItem,
  AchievementUser,
  EventType,
  GoalDefinition,
  GoalProgress
} from '../../../features/achievement/AchievementTypes';
import { defaultAchievement } from '../AllTypes';
import { createActions } from '../utils';

const sagaActions = createActions('achievement', {
  addEvent: (eventNames: EventType[]) => eventNames,
  bulkUpdateAchievements: (items: AchievementItem[]) => items,
  bulkUpdateGoals: (items: GoalDefinition[]) => items,
  getAchievements: 0,
  getGoals: (studentCourseRegId: number) => studentCourseRegId,
  getOwnGoals: 0,
  getUserAssessmentOverviews: (studentCourseRegId: number) => studentCourseRegId,
  getUsers: 0,
  handleEvent: (eventNames: EventType[][]) => eventNames,
  removeAchievement: (uuid: string) => uuid,
  removeGoal: (uuid: string) => uuid,
  updateGoalProgress: (studentCourseRegId: number, progress: GoalProgress) => ({
    studentCourseRegId,
    progress
  }),
  updateOwnGoalProgress: (progress: GoalProgress) => progress
});

const { actions, reducer: AchievementReducer } = createSlice({
  name: 'achievement',
  initialState: defaultAchievement,
  reducers: {
    saveAchievements(state, { payload }: PayloadAction<AchievementItem[]>) {
      state.achievements = payload;
    },
    saveGoals(state, { payload }: PayloadAction<AchievementGoal[]>) {
      state.goals = payload;
    },
    saveUsers(state, { payload }: PayloadAction<AchievementUser[]>) {
      state.users = payload;
    },
    saveUserAssessmentOverviews(state, { payload }: PayloadAction<AssessmentOverview[]>) {
      state.assessmentOverviews = payload;
    }
  }
});

export const achievementActions = {
  ...sagaActions,
  ...actions
};

export { AchievementReducer };
