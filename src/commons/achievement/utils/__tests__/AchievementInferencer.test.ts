import { mockAchievements, mockGoals } from 'src/commons/mocks/AchievementMocks';
import {
  AchievementAbility,
  AchievementGoal,
  AchievementItem,
  GoalType
} from 'src/features/achievement/AchievementTypes';

import AchievementInferencer from '../AchievementInferencer';

const testAchievement: AchievementItem = {
  id: 0,
  title: 'Test Achievement',
  ability: AchievementAbility.CORE,
  isTask: false,
  prerequisiteIds: [],
  goalIds: [],
  position: 0,
  cardBackground:
    'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-background/default.png',
  view: {
    coverImage:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/cover-image/default.png',
    description: 'This is a test achievement',
    completionText: `Congratulations! You've completed the test achievement!`
  }
};

const testGoal: AchievementGoal = {
  id: 0,
  text: 'Test Goal',
  meta: {
    type: GoalType.ASSESSMENT,
    assessmentNumber: 'M1A',
    requiredCompletionFrac: 1
  },
  xp: 0,
  maxXp: 0,
  completed: false
};

describe('Achievement Inferencer Constructor', () => {
  test('Accepts empty achievements and goals', () => {
    const inferencer = new AchievementInferencer([], []);

    expect(inferencer.getAllAchievements()).toEqual([]);
    expect(inferencer.getAllGoals()).toEqual([]);
  });

  test('Accepts non-empty achievements and empty goals', () => {
    const inferencer = new AchievementInferencer([testAchievement], []);

    expect(inferencer.getAllAchievements()).toEqual([testAchievement]);
    expect(inferencer.getAllGoals()).toEqual([]);
  });

  test('Accepts empty achievements and non-empty goals', () => {
    const inferencer = new AchievementInferencer([], [testGoal]);

    expect(inferencer.getAllAchievements()).toEqual([]);
    expect(inferencer.getAllGoals()).toEqual([testGoal]);
  });

  test('Accepts non-empty achievements and non-empty goals', () => {
    const inferencer = new AchievementInferencer(mockAchievements, mockGoals);

    expect(inferencer.getAllAchievements()).toEqual(mockAchievements);
    expect(inferencer.getAllGoals()).toEqual(mockGoals);
  });

  describe('Expected Overlapping ID Behaviors', () => {
    const testAchievement1: AchievementItem = { ...testAchievement, id: 1 };
    const testAchievement2: AchievementItem = { ...testAchievement, id: 2 };
    const testAchievement3: AchievementItem = { ...testAchievement, id: 2 };
    const testGoal1: AchievementGoal = { ...testGoal, id: 1 };
    const testGoal2: AchievementGoal = { ...testGoal, id: 1 };
    const testGoal3: AchievementGoal = { ...testGoal, id: 2 };

    const inferencer = new AchievementInferencer(
      [testAchievement1, testAchievement2, testAchievement3],
      [testGoal1, testGoal2, testGoal3]
    );

    test('Overwrites items of same IDs', () => {
      expect(inferencer.getAllAchievements()).toEqual([testAchievement1, testAchievement2]);
      expect(inferencer.getAllGoals()).toEqual([testGoal1, testGoal3]);
    });

    test('References the correct achievements and goals', () => {
      expect(inferencer.getAchievement(1)).toBe(testAchievement1);
      expect(inferencer.getAchievement(2)).not.toBe(testAchievement2);
      expect(inferencer.getAchievement(2)).toBe(testAchievement3);
      expect(inferencer.getGoal(1)).not.toBe(testGoal1);
      expect(inferencer.getGoal(1)).toBe(testGoal2);
      expect(inferencer.getGoal(2)).toBe(testGoal3);
      expect(inferencer.getGoalDefinition(1)).not.toBe(testGoal1);
      expect(inferencer.getGoalDefinition(1)).toBe(testGoal2);
      expect(inferencer.getGoalDefinition(2)).toBe(testGoal3);
    });
  });
});

describe('Achievement Inferencer Getter', () => {
  const inferencer = new AchievementInferencer(mockAchievements, mockGoals);

  test('Get all achievement IDs', () => {
    const achievementIds = [0, 1, 2, 3, 4, 5, 6, 8, 9, 13, 16, 21];

    expect(inferencer.getAllAchievementIds().sort((a, b) => a - b)).toEqual(achievementIds);
  });

  test('Get all goal IDs', () => {
    const goalIds = [0, 1, 2, 3, 4, 5, 8, 11, 14, 16, 18];

    expect(inferencer.getAllGoalIds().sort((a, b) => a - b)).toEqual(goalIds);
  });

  test('List task IDs', () => {
    const taskIds = [0, 4, 8, 13, 16, 21];

    expect(inferencer.listTaskIds().sort((a, b) => a - b)).toEqual(taskIds);
  });

  test('List sorted task IDs', () => {
    const sortedTaskIds = [0, 8, 21, 4, 16, 13];

    expect(inferencer.listSortedTaskIds()).toEqual(sortedTaskIds);
  });

  test('List goals', () => {
    const testAchievement1 = { ...testAchievement, id: 123, goalIds: [456, 123] };
    const testAchievement2 = { ...testAchievement, id: 456, goalIds: [] };
    const testGoal1 = { ...testGoal, id: 123 };
    const testGoal2 = { ...testGoal, id: 456 };

    const inferencer = new AchievementInferencer(
      [testAchievement1, testAchievement2],
      [testGoal1, testGoal2]
    );

    expect(inferencer.listGoals(123)[0]).toBe(testGoal2);
    expect(inferencer.listGoals(123)[1]).toBe(testGoal1);
    expect(inferencer.listGoals(456)).toEqual([]);
  });

  test('List prerequisite goals', () => {
    const testAchievement1 = {
      ...testAchievement,
      id: 123,
      prerequisiteIds: [456]
    };
    const testAchievement2 = { ...testAchievement, id: 456, goalIds: [456, 123] };
    const testGoal1 = { ...testGoal, id: 123 };
    const testGoal2 = { ...testGoal, id: 456 };

    const inferencer = new AchievementInferencer(
      [testAchievement1, testAchievement2],
      [testGoal1, testGoal2]
    );

    expect(inferencer.listPrerequisiteGoals(123)[0]).toBe(testGoal2);
    expect(inferencer.listPrerequisiteGoals(123)[1]).toBe(testGoal1);
  });
});
