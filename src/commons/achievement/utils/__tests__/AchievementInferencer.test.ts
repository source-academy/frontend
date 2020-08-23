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
    type: GoalType.MANUAL,
    maxXp: 0
  },
  xp: 0,
  maxXp: 0,
  completed: false
};

describe('Achievement Inferencer Constructor', () => {
  test('Empty achievements and goals', () => {
    const inferencer = new AchievementInferencer([], []);

    expect(inferencer.getAllAchievements()).toEqual([]);
    expect(inferencer.getAllGoals()).toEqual([]);
  });

  test('Non-empty achievements and empty goals', () => {
    const inferencer = new AchievementInferencer([testAchievement], []);

    expect(inferencer.getAllAchievements()).toEqual([testAchievement]);
    expect(inferencer.getAllGoals()).toEqual([]);
  });

  test('Empty achievements and non-empty goals', () => {
    const inferencer = new AchievementInferencer([], [testGoal]);

    expect(inferencer.getAllAchievements()).toEqual([]);
    expect(inferencer.getAllGoals()).toEqual([testGoal]);
  });

  test('Non-empty achievements and non-empty goals', () => {
    const inferencer = new AchievementInferencer(mockAchievements, mockGoals);

    expect(inferencer.getAllAchievements()).toEqual(mockAchievements);
    expect(inferencer.getAllGoals()).toEqual(mockGoals);
  });

  describe('Overlapping IDs', () => {
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
    const testAchievement1: AchievementItem = { ...testAchievement, id: 1, goalIds: [2, 1] };
    const testAchievement2: AchievementItem = { ...testAchievement, id: 2, goalIds: [] };

    const testGoal1: AchievementGoal = { ...testGoal, id: 1 };
    const testGoal2: AchievementGoal = { ...testGoal, id: 2 };

    const inferencer = new AchievementInferencer(
      [testAchievement1, testAchievement2],
      [testGoal1, testGoal2]
    );

    expect(inferencer.listGoals(1).length).toBe(2);
    expect(inferencer.listGoals(1)[0]).toBe(testGoal2);
    expect(inferencer.listGoals(1)[1]).toBe(testGoal1);
    expect(inferencer.listGoals(2)).toEqual([]);
  });

  test('List prerequisite goals', () => {
    const testAchievement1: AchievementItem = { ...testAchievement, id: 1, prerequisiteIds: [2] };
    const testAchievement2: AchievementItem = { ...testAchievement, id: 2, goalIds: [2, 1] };

    const testGoal1: AchievementGoal = { ...testGoal, id: 1 };
    const testGoal2: AchievementGoal = { ...testGoal, id: 2 };

    const inferencer = new AchievementInferencer(
      [testAchievement1, testAchievement2],
      [testGoal1, testGoal2]
    );

    expect(inferencer.listPrerequisiteGoals(1).length).toBe(2);
    expect(inferencer.listPrerequisiteGoals(1)[0]).toBe(testGoal2);
    expect(inferencer.listPrerequisiteGoals(1)[1]).toBe(testGoal1);
  });
});

describe('Achievement ID to Title', () => {
  const achievementId = 123;
  const achievementTitle = 'AcH1Ev3m3Nt t1tL3 h3R3';
  const testAchievement1: AchievementItem = {
    ...testAchievement,
    id: achievementId,
    title: achievementTitle
  };

  const inferencer = new AchievementInferencer([testAchievement1], []);

  test('Non-existing achievement ID', () => {
    expect(inferencer.getTitleById(1)).toBeUndefined();
  });

  test('Existing achievement ID', () => {
    expect(inferencer.getTitleById(achievementId)).toBe(achievementTitle);
  });

  test('Non-existing achievement title', () => {
    expect(inferencer.getIdByTitle('IUisL0v3')).toBeUndefined();
  });

  test('Existing achievement title', () => {
    expect(inferencer.getIdByTitle(achievementTitle)).toBe(achievementId);
  });
});

describe('Goal ID to Text', () => {
  const goalId = 123;
  const goalText = 'g0@L T3xt h3R3';
  const testGoal1: AchievementGoal = { ...testGoal, id: goalId, text: goalText };

  const inferencer = new AchievementInferencer([], [testGoal1]);

  test('Non-existing goal ID', () => {
    expect(inferencer.getTextById(1)).toBeUndefined();
  });

  test('Existing goal ID', () => {
    expect(inferencer.getTextById(goalId)).toBe(goalText);
  });

  test('Non-existing goal text', () => {
    expect(inferencer.getIdByText('IUisL0v3')).toBeUndefined();
  });

  test('Existing goal text', () => {
    expect(inferencer.getIdByText(goalText)).toBe(goalId);
  });
});

describe('Achievement Prerequisite System', () => {
  const testAchievement1: AchievementItem = { ...testAchievement, id: 1, prerequisiteIds: [2, 3] };
  const testAchievement2: AchievementItem = { ...testAchievement, id: 2 };
  const testAchievement3: AchievementItem = { ...testAchievement, id: 3, prerequisiteIds: [4] };
  const testAchievement4: AchievementItem = { ...testAchievement, id: 4, prerequisiteIds: [5] };
  const testAchievement5: AchievementItem = { ...testAchievement, id: 5 };

  const inferencer = new AchievementInferencer(
    [testAchievement1, testAchievement2, testAchievement3, testAchievement4, testAchievement5],
    []
  );

  test('Is immediate children', () => {
    expect(inferencer.isImmediateChild(1, 2)).toBeTruthy();
    expect(inferencer.isImmediateChild(1, 3)).toBeTruthy();
    expect(inferencer.isImmediateChild(1, 4)).toBeFalsy();
    expect(inferencer.isImmediateChild(1, 5)).toBeFalsy();
    expect(inferencer.isImmediateChild(1, 101)).toBeFalsy();
  });

  test('Get immediate children', () => {
    expect(inferencer.getImmediateChildren(1)).toEqual(new Set([2, 3]));
    expect(inferencer.getImmediateChildren(2)).toEqual(new Set());
    expect(inferencer.getImmediateChildren(3)).toEqual(new Set([4]));
    expect(inferencer.getImmediateChildren(4)).toEqual(new Set([5]));
    expect(inferencer.getImmediateChildren(101)).toEqual(new Set());
  });

  test('Is descendant', () => {
    expect(inferencer.isDescendant(1, 2)).toBeTruthy();
    expect(inferencer.isDescendant(1, 3)).toBeTruthy();
    expect(inferencer.isDescendant(1, 4)).toBeTruthy();
    expect(inferencer.isDescendant(1, 5)).toBeTruthy();
    expect(inferencer.isDescendant(1, 101)).toBeFalsy();
  });

  test('Get descendants', () => {
    expect(inferencer.getDescendants(1)).toEqual(new Set([2, 3, 4, 5]));
    expect(inferencer.getDescendants(2)).toEqual(new Set());
    expect(inferencer.getDescendants(3)).toEqual(new Set([4, 5]));
    expect(inferencer.getDescendants(4)).toEqual(new Set([5]));
    expect(inferencer.getDescendants(101)).toEqual(new Set());
  });

  test('List available prerequisite IDs', () => {
    expect(inferencer.listAvailablePrerequisiteIds(1)).toEqual([]);
    expect(inferencer.listAvailablePrerequisiteIds(2)).toEqual([3, 4, 5]);
    expect(inferencer.listAvailablePrerequisiteIds(3)).toEqual([2]);
    expect(inferencer.listAvailablePrerequisiteIds(4)).toEqual([2]);
    expect(inferencer.listAvailablePrerequisiteIds(5)).toEqual([2]);
    expect(inferencer.listAvailablePrerequisiteIds(101)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('Achievement XP System', () => {
  const testAchievement1: AchievementItem = { ...testAchievement, id: 1, goalIds: [1, 2] };
  const testAchievement2: AchievementItem = { ...testAchievement, id: 2, goalIds: [] };

  const testGoal1: AchievementGoal = { ...testGoal, id: 1, xp: 100, maxXp: 100 };
  const testGoal2: AchievementGoal = { ...testGoal, id: 2, xp: 20, maxXp: 100 };
  const testGoal3: AchievementGoal = { ...testGoal, id: 3, xp: 3, maxXp: 100 };

  const inferencer = new AchievementInferencer(
    [testAchievement1, testAchievement2],
    [testGoal1, testGoal2, testGoal3]
  );

  test('XP earned from an achievement', () => {
    expect(inferencer.getAchievementXp(1)).toBe(120);
    expect(inferencer.getAchievementXp(2)).toBe(0);
  });

  test('Max XP earned from an achievement', () => {
    expect(inferencer.getAchievementMaxXp(1)).toBe(200);
    expect(inferencer.getAchievementMaxXp(2)).toBe(0);
  });

  test('Total XP earned from all goals', () => {
    expect(inferencer.getTotalXp()).toBe(123);
  });

  test('Progress frac from an achievement', () => {
    expect(inferencer.getProgressFrac(1)).toBeCloseTo(120 / 200);
    expect(inferencer.getProgressFrac(2)).toBe(0);
  });
});

describe('Achievement Display Deadline', () => {
  const expiredDeadline = new Date(1920, 1, 1);
  const closerExpiredDeadline = new Date(2020, 1, 1);
  const closestUnexpiredDeadline = new Date(2070, 1, 1);
  const closerUnexpiredDeadline = new Date(2120, 1, 1);
  const unexpiredDeadline = new Date(2220, 1, 1);

  const testAchievement1: AchievementItem = { ...testAchievement, id: 1, prerequisiteIds: [2, 5] };
  const testAchievement2: AchievementItem = { ...testAchievement, id: 2, prerequisiteIds: [3, 4] };
  const testAchievement3: AchievementItem = { ...testAchievement, id: 3 };
  const testAchievement4: AchievementItem = { ...testAchievement, id: 4 };
  const testAchievement5: AchievementItem = { ...testAchievement, id: 5 };

  test('All deadlines undefined', () => {
    const inferencer = new AchievementInferencer(
      [testAchievement1, testAchievement2, testAchievement3, testAchievement4, testAchievement5],
      []
    );

    expect(inferencer.getDisplayDeadline(1)).toBeUndefined();
    expect(inferencer.getDisplayDeadline(2)).toBeUndefined();
    expect(inferencer.getDisplayDeadline(3)).toBeUndefined();
    expect(inferencer.getDisplayDeadline(4)).toBeUndefined();
    expect(inferencer.getDisplayDeadline(5)).toBeUndefined();
    expect(inferencer.getDisplayDeadline(101)).toBeUndefined();
  });

  test('All deadlines expired', () => {
    testAchievement1.deadline = expiredDeadline;
    testAchievement2.deadline = expiredDeadline;
    testAchievement3.deadline = expiredDeadline;
    testAchievement4.deadline = expiredDeadline;
    testAchievement5.deadline = expiredDeadline;

    const inferencer = new AchievementInferencer(
      [testAchievement1, testAchievement2, testAchievement3, testAchievement4, testAchievement5],
      []
    );

    expect(inferencer.getDisplayDeadline(1)).toEqual(expiredDeadline);
    expect(inferencer.getDisplayDeadline(2)).toEqual(expiredDeadline);
    expect(inferencer.getDisplayDeadline(3)).toEqual(expiredDeadline);
    expect(inferencer.getDisplayDeadline(4)).toEqual(expiredDeadline);
    expect(inferencer.getDisplayDeadline(5)).toEqual(expiredDeadline);
  });

  test('Display own deadline if no unexpired descendant deadline', () => {
    testAchievement1.deadline = expiredDeadline;
    testAchievement2.deadline = undefined;
    testAchievement3.deadline = expiredDeadline;
    testAchievement4.deadline = undefined;
    testAchievement5.deadline = closerExpiredDeadline;

    const inferencer = new AchievementInferencer(
      [testAchievement1, testAchievement2, testAchievement3, testAchievement4, testAchievement5],
      []
    );

    expect(inferencer.getDisplayDeadline(1)).toEqual(expiredDeadline);
    expect(inferencer.getDisplayDeadline(2)).toBeUndefined();
    expect(inferencer.getDisplayDeadline(3)).toEqual(expiredDeadline);
    expect(inferencer.getDisplayDeadline(4)).toBeUndefined();
    expect(inferencer.getDisplayDeadline(5)).toEqual(closerExpiredDeadline);
  });

  test('Display closest unexpired deadline', () => {
    testAchievement1.deadline = undefined;
    testAchievement2.deadline = expiredDeadline;
    testAchievement3.deadline = closestUnexpiredDeadline;
    testAchievement4.deadline = unexpiredDeadline;
    testAchievement5.deadline = closerUnexpiredDeadline;

    const inferencer = new AchievementInferencer(
      [testAchievement1, testAchievement2, testAchievement3, testAchievement4, testAchievement5],
      []
    );

    expect(inferencer.getDisplayDeadline(1)).toEqual(closestUnexpiredDeadline);
    expect(inferencer.getDisplayDeadline(2)).toEqual(closestUnexpiredDeadline);
    expect(inferencer.getDisplayDeadline(3)).toEqual(closestUnexpiredDeadline);
    expect(inferencer.getDisplayDeadline(4)).toEqual(unexpiredDeadline);
    expect(inferencer.getDisplayDeadline(5)).toEqual(closerUnexpiredDeadline);
  });
});
