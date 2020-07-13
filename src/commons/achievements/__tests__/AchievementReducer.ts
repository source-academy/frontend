import { AchievementReducer } from '../AchievementReducer';
import { AchievementState, defaultAchievements, SAVE_ACHIEVEMENTS } from '../AchievementTypes';

test('SAVE_ACHIEVEMENTS works correctly on default achievements', () => {
  const action = {
    type: SAVE_ACHIEVEMENTS,
    payload: []
  };
  const result: AchievementState = AchievementReducer(defaultAchievements, action);

  expect(result).toEqual(defaultAchievements);
});
