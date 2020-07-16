import { action } from 'typesafe-actions';

import {
  AchievementGoal,
  AchievementItem,
  EDIT_ACHIEVEMENT,
  GET_ACHIEVEMENTS,
  REMOVE_ACHIEVEMENT,
  REMOVE_GOAL,
  SAVE_ACHIEVEMENTS
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
