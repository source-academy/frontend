import { action } from 'typesafe-actions';

import {
  AchievementGoal,
  AchievementItem,
  EDIT_ACHIEVEMENT,
  EDIT_GOAL,
  GET_ACHIEVEMENTS,
  GET_OWN_GOALS,
  GET_GOALS,
  REMOVE_ACHIEVEMENT,
  REMOVE_GOAL,
  SAVE_ACHIEVEMENTS,
  SAVE_GOALS,
  UPDATE_GOAL_PROGRESS
} from './AchievementTypes';

/*
  Note: This Updates the store for our Achievements in the frontend. 
  Please refer to AchievementReducer to find out more. 
*/
export const saveAchievements = (achievements: AchievementItem[]) =>
  action(SAVE_ACHIEVEMENTS, achievements);

export const getAchievements = () => action(GET_ACHIEVEMENTS);

export const removeAchievement = (achievement: AchievementItem) =>
  action(REMOVE_ACHIEVEMENT, achievement);

export const editAchievement = (achievement: AchievementItem) =>
  action(EDIT_ACHIEVEMENT, achievement);

/* Will be deprecated after a separate db for student progress is ready */
export const removeGoal = (goal: AchievementGoal, achievement: AchievementItem) =>
  action(REMOVE_GOAL, { goal, achievement });

export const saveGoals = (goals: AchievementGoal[]) => action(SAVE_GOALS, goals);

export const getGoals = () => action(GET_GOALS);

export const getOwnGoals = () => action(GET_OWN_GOALS);

// TODO: Change type to GoalDefinition
export const editGoal = (definition: any) => action(EDIT_GOAL, definition);

// TODO: Change type to GoalProgress
export const updateGoalProgress = (progress: any) => action(UPDATE_GOAL_PROGRESS, progress);
