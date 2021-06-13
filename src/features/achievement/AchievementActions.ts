import { action } from 'typesafe-actions';

import {
  AchievementGoal,
  AchievementItem,
  AchievementUser,
  ADD_EVENT,
  BULK_UPDATE_ACHIEVEMENTS,
  BULK_UPDATE_GOALS,
  // EDIT_ACHIEVEMENT,
  // EDIT_GOAL,
  EventType,
  GET_ACHIEVEMENTS,
  GET_GOALS,
  GET_OWN_GOALS,
  GET_USERS,
  GoalDefinition,
  GoalProgress,
  HANDLE_EVENT,
  REMOVE_ACHIEVEMENT,
  REMOVE_GOAL,
  SAVE_ACHIEVEMENTS,
  SAVE_GOALS,
  SAVE_USERS,
  UPDATE_GOAL_PROGRESS,
  UPDATE_OWN_GOAL_PROGRESS
} from './AchievementTypes';

export const bulkUpdateAchievements = (achievements: AchievementItem[]) =>
  action(BULK_UPDATE_ACHIEVEMENTS, achievements);

export const bulkUpdateGoals = (goals: GoalDefinition[]) => action(BULK_UPDATE_GOALS, goals);

// export const editAchievement = (achievement: AchievementItem) =>
//   action(EDIT_ACHIEVEMENT, achievement);

// export const editGoal = (definition: GoalDefinition) => action(EDIT_GOAL, definition);

export const getAchievements = () => action(GET_ACHIEVEMENTS);

export const getGoals = (studentId: number) => action(GET_GOALS, studentId);

export const getOwnGoals = () => action(GET_OWN_GOALS);

export const getUsers = () => action(GET_USERS);

export const removeAchievement = (uuid: string) => action(REMOVE_ACHIEVEMENT, uuid);

export const removeGoal = (uuid: string) => action(REMOVE_GOAL, uuid);

export const updateOwnGoalProgress = (progress: GoalProgress) =>
  action(UPDATE_OWN_GOAL_PROGRESS, progress);

export const addEvent = (eventNames: EventType[]) => action(ADD_EVENT, eventNames);

export const handleEvent = (loggedEvents: EventType[][]) => action(HANDLE_EVENT, loggedEvents);

export const updateGoalProgress = (studentId: number, progress: GoalProgress) =>
  action(UPDATE_GOAL_PROGRESS, { studentId, progress });

/*
  Note: This updates the frontend Achievement Redux store.
  Please refer to AchievementReducer to find out more. 
*/
export const saveAchievements = (achievements: AchievementItem[]) =>
  action(SAVE_ACHIEVEMENTS, achievements);

/*
  Note: This updates the frontend Achievement Redux store.
  Please refer to AchievementReducer to find out more. 
*/
export const saveGoals = (goals: AchievementGoal[]) => action(SAVE_GOALS, goals);

/*
  Note: This updates the frontend Achievement Redux store.
  Please refer to AchievementReducer to find out more. 
*/
export const saveUsers = (users: AchievementUser[]) => action(SAVE_USERS, users);
