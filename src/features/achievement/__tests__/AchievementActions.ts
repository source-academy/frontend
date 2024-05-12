import { mockAchievements } from '../../../commons/mocks/AchievementMocks';
import { getAchievements, removeAchievement, saveAchievements } from '../AchievementActions';

test('saveAchievements generates correct action object', () => {
  const action = saveAchievements([]);

  expect(action).toEqual({
    type: saveAchievements.type,
    payload: []
  });
});

test('getAchievements generates correct action object', () => {
  const action = getAchievements();

  expect(action).toEqual({
    type: getAchievements.type,
    payload: {}
  });
});

test('removeAchievement generates correct action object', () => {
  const action = removeAchievement(mockAchievements[0].uuid);

  expect(action).toEqual({
    type: removeAchievement.type,
    payload: mockAchievements[0].uuid
  });
});
