import {
  updateAchievements,
  saveAchievements,
  getAchievements,
  removeAchievement,
  editAchievement,
  removeGoal
} from '../AchievementActions';

import {
  UPDATE_ACHIEVEMENTS,
  SAVE_ACHIEVEMENTS,
  GET_ACHIEVEMENTS,
  REMOVE_ACHIEVEMENT,
  EDIT_ACHIEVEMENT,
  REMOVE_GOAL
} from '../AchievementTypes';
import { defaultMockAchievements } from 'src/commons/mocks/AchievementMocks';

test('updateAchievements generates correct action object', () => {
  const action = updateAchievements([]);

  expect(action).toEqual({
    type: UPDATE_ACHIEVEMENTS,
    payload: []
  });
});

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
  const action = removeAchievement(defaultMockAchievements[0]);

  expect(action).toEqual({
    type: REMOVE_ACHIEVEMENT,
    payload: defaultMockAchievements[0]
  });
});

test('editAchievement generates correct action object', () => {
  const action = editAchievement(defaultMockAchievements[0]);

  expect(action).toEqual({
    type: EDIT_ACHIEVEMENT,
    payload: defaultMockAchievements[0]
  });
});

test('removeGoal generates correct action object', () => {
  const action = removeGoal(defaultMockAchievements[0].goals[0], defaultMockAchievements[0]);

  expect(action).toEqual({
    type: REMOVE_GOAL,
    payload: {
      goal: defaultMockAchievements[0].goals[0],
      achievement: defaultMockAchievements[0]
    }
  });
});
