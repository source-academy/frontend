import { action } from 'typesafe-actions';

import {
  ADD_ACHIEVEMENT,
  DELETE_ACHIEVEMENT,
  EDIT_ACHIEVEMENT,
  GET_ACHIEVEMENTS,
  ADD_TASK,
  DELETE_TASK,
  EDIT_TASK,
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

export const addTask = (achievementID: number) =>
  action(ADD_TASK, {
    achievementID
  });

export const deleteTask = (achievementID: number) =>
  action(DELETE_TASK, {
    achievementID
  });

export const editTask = (achievementID: number, achievement: AchievementItem) =>
  action(EDIT_TASK, {
    achievementID,
    achievement
  });
