import { action } from 'typesafe-actions';

import {
  ADD_ACHIEVEMENT,
  DELETE_ACHIEVEMENT,
  EDIT_ACHIEVEMENT,
  GET_ACHIEVEMENTS,
  AchievementItem
} from './AchievementTypes';

export const addAchievement = () => action(ADD_ACHIEVEMENT);

export const deleteAchievement = (achievementID: number) =>
  action(DELETE_ACHIEVEMENT, {
    achievementID
  });

export const editAchievement = (achievementID: number, achievement: AchievementItem) =>
  action(EDIT_ACHIEVEMENT, {
    achievementID,
    achievement
  });

export const getAchievements = () => action(GET_ACHIEVEMENTS);
