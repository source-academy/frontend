import { action } from 'typesafe-actions';

import {
  UPDATE_ACHIEVEMENTS,
  SAVE_ACHIEVEMENTS,
  GET_ACHIEVEMENTS,
  AchievementItem,
  EDIT_ACHIEVEMENT
} from './AchievementTypes';

export const updateAchievements = (achievements: AchievementItem[]) =>
  action(UPDATE_ACHIEVEMENTS, achievements);

export const saveAchievements = (achievements: AchievementItem[]) =>
  action(SAVE_ACHIEVEMENTS, achievements);

export const getAchievements = () => action(GET_ACHIEVEMENTS);

export const editAchievement = (achievement: AchievementItem) =>
  action(EDIT_ACHIEVEMENT, achievement);
