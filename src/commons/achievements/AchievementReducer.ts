import { Reducer } from 'redux';

import { SourceActionType } from '../../commons/utils/ActionsHelper';

import { AchievementState, defaultAchievements, SAVE_ACHIEVEMENTS } from './AchievementTypes';

export const AchievementReducer: Reducer<AchievementState> = (
  state = defaultAchievements,
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
