import { Reducer } from 'redux';

import { SourceActionType } from '../../commons/utils/ActionsHelper';

import { AchievementState, defaultAchievements } from './AchievementTypes';

export const PlaygroundReducer: Reducer<AchievementState> = (
  state = defaultAchievements,
  action: SourceActionType
) => {
  switch (action.type) {
    default:
      return state;
  }
};
