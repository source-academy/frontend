import { defaultAchievement } from 'src/commons/application/ApplicationTypes';

import { AchievementReducer } from '../AchievementReducer';
import { AchievementState, SAVE_ACHIEVEMENTS } from '../AchievementTypes';

test('SAVE_ACHIEVEMENTS works correctly on default achievements', () => {
  const action = {
    type: SAVE_ACHIEVEMENTS,
    payload: []
  };
  const result: AchievementState = AchievementReducer(defaultAchievement, action);

  expect(result).toEqual(defaultAchievement);
});
