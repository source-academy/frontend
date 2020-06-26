import { action } from 'typesafe-actions';

import { UPDATE_ACHIEVEMENTS, GET_ACHIEVEMENTS, AchievementItem } from './AchievementTypes';

export const updateAchievements = (achievements: AchievementItem[]) =>
  action(UPDATE_ACHIEVEMENTS, achievements);

export const getAchievements = () => action(GET_ACHIEVEMENTS);

export const addAchievement = (achievement: AchievementItem) =>
  action(GET_ACHIEVEMENTS, achievement);

export const editAchievement = (achievement: AchievementItem) =>
  action(GET_ACHIEVEMENTS, achievement);

export const deleteAchievement = (achievement: AchievementItem) =>
  action(GET_ACHIEVEMENTS, achievement);
