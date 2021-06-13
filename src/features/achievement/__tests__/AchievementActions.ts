import { mockAchievements } from '../../../commons/mocks/AchievementMocks';
import {
  // editAchievement,
  getAchievements,
  removeAchievement,
  saveAchievements
} from '../AchievementActions';
import {
  // EDIT_ACHIEVEMENT,
  GET_ACHIEVEMENTS,
  REMOVE_ACHIEVEMENT,
  SAVE_ACHIEVEMENTS
} from '../AchievementTypes';

test('saveAchievements generates correct action object', () => {
  const action = saveAchievements([]);

  expect(action).toEqual({
    type: SAVE_ACHIEVEMENTS,
    payload: []
  });
});

test('getAchievements generates correct action object', () => {
  const action = getAchievements();

  expect(action).toEqual({
    type: GET_ACHIEVEMENTS
  });
});

test('removeAchievement generates correct action object', () => {
  const action = removeAchievement(mockAchievements[0].uuid);

  expect(action).toEqual({
    type: REMOVE_ACHIEVEMENT,
    payload: mockAchievements[0].uuid
  });
});

// test('editAchievement generates correct action object', () => {
//   const action = editAchievement(mockAchievements[0]);

//   expect(action).toEqual({
//     type: EDIT_ACHIEVEMENT,
//     payload: mockAchievements[0]
//   });
// });
