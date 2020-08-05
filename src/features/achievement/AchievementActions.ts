import { action } from 'typesafe-actions';

import {
  AchievementGoal,
  AchievementItem,
  EDIT_ACHIEVEMENT,
  EDIT_GOAL,
  GET_ACHIEVEMENTS,
  GET_GOALS,
  GET_OWN_GOALS,
  GoalDefinition,
  GoalProgress,
  REMOVE_ACHIEVEMENT,
  REMOVE_GOAL,
  SAVE_ACHIEVEMENTS,
  SAVE_GOALS,
  UPDATE_GOAL_PROGRESS
} from './AchievementTypes';

export const editAchievement = (achievement: AchievementItem) =>
  action(EDIT_ACHIEVEMENT, achievement);

export const editGoal = (definition: GoalDefinition) => action(EDIT_GOAL, definition);

export const getAchievements = () => action(GET_ACHIEVEMENTS);

export const getGoals = (studentId: number) => action(GET_GOALS, studentId);

export const getOwnGoals = () => action(GET_OWN_GOALS);

export const removeAchievement = (achievement: AchievementItem) =>
  action(REMOVE_ACHIEVEMENT, achievement);

export const removeGoal = (definition: GoalDefinition) => action(REMOVE_GOAL, definition);

/*
  Note: This Updates the store for our Achievements in the frontend. 
  Please refer to AchievementReducer to find out more. 
*/
export const saveAchievements = (achievements: AchievementItem[]) =>
  action(SAVE_ACHIEVEMENTS, achievements);

export const saveGoals = (goals: AchievementGoal[]) => action(SAVE_GOALS, goals);

export const updateGoalProgress = (studentId: number, progress: GoalProgress) =>
  action(UPDATE_GOAL_PROGRESS, { studentId, progress });
