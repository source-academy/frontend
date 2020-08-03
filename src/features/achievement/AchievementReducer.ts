import { Reducer } from 'redux';

import { defaultAchievement } from '../../commons/application/ApplicationTypes';
import { SourceActionType } from '../../commons/utils/ActionsHelper';
import { AchievementState, SAVE_ACHIEVEMENTS } from './AchievementTypes';

export const AchievementReducer: Reducer<AchievementState> = (
  state = defaultAchievement,
  action: SourceActionType
) => {
  switch (action.type) {
    case SAVE_ACHIEVEMENTS:
      return {
        ...state,
        achievements: action.payload
      };
    default:
      return state;
  }
};
