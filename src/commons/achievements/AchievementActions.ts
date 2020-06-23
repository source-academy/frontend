import { action } from 'typesafe-actions';

import { UPDATE_ACHIEVEMENTS, GET_ACHIEVEMENTS, AchievementItem } from './AchievementTypes';

export const editAchievements = (achievements: AchievementItem[]) =>
  action(UPDATE_ACHIEVEMENTS, achievements);

export const getAchievements = () => action(GET_ACHIEVEMENTS);
