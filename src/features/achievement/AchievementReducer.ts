import { Reducer } from 'redux';

import { defaultAchievement } from '../../commons/application/ApplicationTypes';
import { SourceActionType } from '../../commons/utils/ActionsHelper';
import { AchievementState, SAVE_ACHIEVEMENTS, SAVE_GOALS, SAVE_USERS } from './AchievementTypes';

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
    case SAVE_GOALS:
      return {
        ...state,
        goals: action.payload
      };
    case SAVE_USERS:
      return {
        ...state,
        users: action.payload
      }
    default:
      return state;
  }
};
