import { createAction } from '@reduxjs/toolkit';
import { AssessmentOverview } from 'src/commons/assessment/AssessmentTypes';
import { action } from 'typesafe-actions';

import {
  AchievementGoal,
  AchievementItem,
  AchievementUser,
  ADD_EVENT,
  BULK_UPDATE_ACHIEVEMENTS,
  BULK_UPDATE_GOALS,
  EventType,
  GET_ACHIEVEMENTS,
  GET_GOALS,
  GET_OWN_GOALS,
  GET_USER_ASSESSMENT_OVERVIEWS,
  GET_USERS,
  GoalDefinition,
  GoalProgress,
  HANDLE_EVENT,
  REMOVE_ACHIEVEMENT,
  REMOVE_GOAL,
  SAVE_ACHIEVEMENTS,
  SAVE_GOALS,
  SAVE_USER_ASSESSMENT_OVERVIEWS,
  SAVE_USERS,
  UPDATE_GOAL_PROGRESS,
  UPDATE_OWN_GOAL_PROGRESS
} from './AchievementTypes';

export const bulkUpdateAchievements = createAction(
  BULK_UPDATE_ACHIEVEMENTS,
  (achievements: AchievementItem[]) => ({ payload: achievements })
);

export const bulkUpdateGoals = createAction(BULK_UPDATE_GOALS, (goals: GoalDefinition[]) => ({
  payload: goals
}));

export const getAchievements = () => action(GET_ACHIEVEMENTS);

export const getGoals = createAction(GET_GOALS, (studentCourseRegId: number) => ({
  payload: studentCourseRegId
}));

export const getOwnGoals = createAction(GET_OWN_GOALS, () => ({ payload: {} }));

export const getUserAssessmentOverviews = createAction(
  GET_USER_ASSESSMENT_OVERVIEWS,
  (studentCourseRegId: number) => ({ payload: studentCourseRegId })
);

export const getUsers = createAction(GET_USERS, () => ({ payload: {} }));

export const removeAchievement = createAction(REMOVE_ACHIEVEMENT, (uuid: string) => ({
  payload: uuid
}));

export const removeGoal = createAction(REMOVE_GOAL, (uuid: string) => ({ payload: uuid }));

export const updateOwnGoalProgress = createAction(
  UPDATE_OWN_GOAL_PROGRESS,
  (progress: GoalProgress) => ({ payload: progress })
);

export const addEvent = createAction(ADD_EVENT, (eventNames: EventType[]) => ({
  payload: eventNames
}));

export const handleEvent = createAction(HANDLE_EVENT, (loggedEvents: EventType[][]) => ({
  payload: loggedEvents
}));

export const updateGoalProgress = createAction(
  UPDATE_GOAL_PROGRESS,
  (studentCourseRegId: number, progress: GoalProgress) => ({
    payload: { studentCourseRegId, progress }
  })
);

/*
  Note: This updates the frontend Achievement Redux store.
  Please refer to AchievementReducer to find out more. 
*/
export const saveAchievements = createAction(
  SAVE_ACHIEVEMENTS,
  (achievements: AchievementItem[]) => ({ payload: achievements })
);

/*
  Note: This updates the frontend Achievement Redux store.
  Please refer to AchievementReducer to find out more. 
*/
export const saveGoals = createAction(SAVE_GOALS, (goals: AchievementGoal[]) => ({
  payload: goals
}));

/*
  Note: This updates the frontend Achievement Redux store.
  Please refer to AchievementReducer to find out more. 
*/
export const saveUsers = createAction(SAVE_USERS, (users: AchievementUser[]) => ({
  payload: users
}));

/*
  Note: This updates the frontend Achievement Redux store.
  Please refer to AchievementReducer to find out more. 
*/
export const saveUserAssessmentOverviews = createAction(
  SAVE_USER_ASSESSMENT_OVERVIEWS,
  (assessmentOverviews: AssessmentOverview[]) => ({ payload: assessmentOverviews })
);
