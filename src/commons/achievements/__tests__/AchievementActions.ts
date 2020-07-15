import { mockAchievements } from 'src/commons/mocks/AchievementMocks';

import {
  editAchievement,
  getAchievements,
  removeAchievement,
  removeGoal,
  saveAchievements,
  updateAchievements
} from '../AchievementActions';
import {
  EDIT_ACHIEVEMENT,
  GET_ACHIEVEMENTS,
  REMOVE_ACHIEVEMENT,
  REMOVE_GOAL,
  SAVE_ACHIEVEMENTS,
  UPDATE_ACHIEVEMENTS
} from '../AchievementTypes';

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
  const action = removeAchievement(mockAchievements[0]);

  expect(action).toEqual({
    type: REMOVE_ACHIEVEMENT,
    payload: mockAchievements[0]
  });
});

test('editAchievement generates correct action object', () => {
  const action = editAchievement(mockAchievements[0]);

  expect(action).toEqual({
    type: EDIT_ACHIEVEMENT,
    payload: mockAchievements[0]
  });
});

test('removeGoal generates correct action object', () => {
  const action = removeGoal(mockAchievements[0].goals[0], mockAchievements[0]);

  expect(action).toEqual({
    type: REMOVE_GOAL,
    payload: {
      goal: mockAchievements[0].goals[0],
      achievement: mockAchievements[0]
    }
  });
});
