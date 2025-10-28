import { mockAchievements } from '../../../commons/mocks/AchievementMocks';
import AchievementActions from '../AchievementActions';

test('saveAchievements generates correct action object', () => {
  const action = AchievementActions.saveAchievements([]);

  expect(action).toEqual({
    type: AchievementActions.saveAchievements.type,
    payload: []
  });
});

test('getAchievements generates correct action object', () => {
  const action = AchievementActions.getAchievements();

  expect(action).toEqual({
    type: AchievementActions.getAchievements.type,
    payload: {}
  });
});

test('removeAchievement generates correct action object', () => {
  const action = AchievementActions.removeAchievement(mockAchievements[0].uuid);

  expect(action).toEqual({
    type: AchievementActions.removeAchievement.type,
    payload: mockAchievements[0].uuid
  });
});
