import { action } from 'typesafe-actions';

import {
  UPDATE_ACHIEVEMENTS,
  SAVE_ACHIEVEMENTS,
  GET_ACHIEVEMENTS,
  EDIT_ACHIEVEMENT,
  AchievementItem
} from './AchievementTypes';

/*
  Note: This Updates the Achievements in the Backend. 
*/
export const updateAchievements = (achievements: AchievementItem[]) =>
  action(UPDATE_ACHIEVEMENTS, achievements);

/*
  Note: This Updates the store for our Achievements in the frontend. 
  Please refer to AchievementReducer to find out more. 
*/
export const saveAchievements = (achievements: AchievementItem[]) =>
  action(SAVE_ACHIEVEMENTS, achievements);

export const getAchievements = () => action(GET_ACHIEVEMENTS);

export const editAchievement = (achievement: AchievementItem) =>
  action(EDIT_ACHIEVEMENT, achievement);
