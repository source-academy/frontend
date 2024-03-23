import { defaultAchievement } from 'src/commons/application/ApplicationTypes';

import { AchievementReducer } from '../AchievementReducer';
import { AchievementItem, AchievementState, SAVE_ACHIEVEMENTS } from '../AchievementTypes';

test('SAVE_ACHIEVEMENTS works correctly on default achievements', () => {
  const achievementItems: AchievementItem[] = [];
  const action = {
    type: SAVE_ACHIEVEMENTS,
    payload: achievementItems
  } as const;
  const result: AchievementState = AchievementReducer(defaultAchievement, action);

  expect(result).toEqual(defaultAchievement);
});
