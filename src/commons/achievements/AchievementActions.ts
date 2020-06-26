import { action } from 'typesafe-actions';

import {
  UPDATE_ACHIEVEMENTS,
  GET_ACHIEVEMENTS,
  AchievementItem,
  ADD_ACHIEVEMENT,
  EDIT_ACHIEVEMENT,
  DELETE_ACHIEVEMENT
} from './AchievementTypes';

export const updateAchievements = (achievements: AchievementItem[]) =>
  action(UPDATE_ACHIEVEMENTS, achievements);

export const getAchievements = () => action(GET_ACHIEVEMENTS);

export const addAchievement = (achievement: AchievementItem) =>
  action(ADD_ACHIEVEMENT, achievement);

export const editAchievement = (achievement: AchievementItem) =>
  action(EDIT_ACHIEVEMENT, achievement);

export const deleteAchievement = (achievement: AchievementItem) =>
  action(DELETE_ACHIEVEMENT, achievement);
