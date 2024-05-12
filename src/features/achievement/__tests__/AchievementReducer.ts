import { defaultAchievement } from 'src/commons/application/ApplicationTypes';

import { saveAchievements } from '../AchievementActions';
import { AchievementReducer } from '../AchievementReducer';
import { AchievementItem, AchievementState } from '../AchievementTypes';

test('SAVE_ACHIEVEMENTS works correctly on default achievements', () => {
  const achievementItems: AchievementItem[] = [];
  const action = {
    type: saveAchievements.type,
    payload: achievementItems
  } as const;
  const result: AchievementState = AchievementReducer(defaultAchievement, action);

  expect(result).toEqual(defaultAchievement);
});
