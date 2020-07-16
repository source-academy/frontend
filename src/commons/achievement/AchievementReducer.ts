import { Reducer } from 'redux';

import { SourceActionType } from '../utils/ActionsHelper';
import { AchievementState, defaultAchievement, SAVE_ACHIEVEMENTS } from './AchievementTypes';

export const AchievementReducer: Reducer<AchievementState> = (
  state = defaultAchievement,
  action: SourceActionType
) => {
  switch (action.type) {
    case SAVE_ACHIEVEMENTS:
      return {
        achievements: action.payload
      };
    default:
      return state;
  }
};
