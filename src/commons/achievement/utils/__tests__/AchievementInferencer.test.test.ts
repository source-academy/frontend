import { mockAchievements, mockGoals } from 'src/commons/mocks/AchievementMocks';
import {
  AchievementGoal,
  AchievementItem,
  AchievementStatus,
  GoalType
} from 'src/features/achievement/AchievementTypes';

import AchievementInferencer from '../AchievementInferencer';

// NOTE: changed to not raise errors due to id changing to uuid. Some tests likely will not work.
// Especially those that depend on the sorting of the achievements. These have been commented out.

const testAchievement: AchievementItem = {
  uuid: '0',
  title: 'Test Achievement',
  xp: 100,
  isVariableXp: false,
  isTask: false,
  prerequisiteUuids: [],
  goalUuids: [],
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
  uuid: '0',
  text: 'Test Goal',
  achievementUuids: [],
  meta: {
    type: GoalType.MANUAL,
    targetCount: 1
  },
  count: 0,
  targetCount: 1,
  completed: false
};

const testGoalComplete: AchievementGoal = {
  uuid: '0',
  text: 'Test Goal',
  achievementUuids: [],
  meta: {
    type: GoalType.MANUAL,
    targetCount: 1
  },
  count: 1,
  targetCount: 1,
  completed: true
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
    const testAchievement1: AchievementItem = {
      ...testAchievement,
      uuid: '1',
      title: 'testAchievement1'
    };
    const testAchievement2: AchievementItem = {
      ...testAchievement,
      uuid: '2',
      title: 'testAchievement2'
    };
    const testAchievement3: AchievementItem = {
      ...testAchievement,
      uuid: '2',
      title: 'testAchievement3'
    };

    const testGoal1: AchievementGoal = { ...testGoal, uuid: '1', text: 'testGoal1' };
    const testGoal2: AchievementGoal = { ...testGoal, uuid: '1', text: 'testGoal2' };
    const testGoal3: AchievementGoal = { ...testGoal, uuid: '2', text: 'testGoal3' };

    const inferencer = new AchievementInferencer(
      [testAchievement1, testAchievement2, testAchievement3],
      [testGoal1, testGoal2, testGoal3]
    );

    test('Overwrites items of same IDs', () => {
      expect(inferencer.getAllAchievements()).toEqual([testAchievement1, testAchievement3]);
      expect(inferencer.getAllGoals()).toEqual([testGoal2, testGoal3]);
    });

    test('References the correct achievements and goals', () => {
      expect(inferencer.getAchievement('1')).toEqual(testAchievement1);
      expect(inferencer.getAchievement('2')).not.toEqual(testAchievement2);
      expect(inferencer.getAchievement('2')).toEqual(testAchievement3);
      expect(inferencer.getGoal('1')).not.toEqual(testGoal1);
      expect(inferencer.getGoal('1')).toEqual(testGoal2);
      expect(inferencer.getGoal('2')).toEqual(testGoal3);
      expect(inferencer.getGoalDefinition('1')).not.toEqual(testGoal1);
      expect(inferencer.getGoalDefinition('1')).toEqual(testGoal2);
      expect(inferencer.getGoalDefinition('2')).toEqual(testGoal3);
    });
  });
});

describe('Achievement Setter', () => {
  const testAchievement1: AchievementItem = {
    ...testAchievement,
    uuid: '1',
    title: 'Test Achievement 1',
    prerequisiteUuids: ['2', '2', '3', '3', '3', '4'],
    goalUuids: ['1', '2', '2', '1']
  };

  const testGoal1: AchievementGoal = {
    ...testGoal,
    uuid: '1',
    text: 'Test Goal 1'
  };

  const inferencer = new AchievementInferencer(mockAchievements, mockGoals);

  test('Insert new achievement', () => {
    // Before insertion
    expect(inferencer.getAllAchievements().length).toBe(mockAchievements.length);
    expect(inferencer.getUuidByTitle('Test Achievement 1')).toBeUndefined();

    const newUuid = inferencer.insertAchievement(testAchievement1);

    // After insertion
    expect(inferencer.getAllAchievements().length).toBe(mockAchievements.length + 1);
    expect(inferencer.getAchievement('1')).toEqual(mockAchievements[1]);
    expect(inferencer.getAchievement(newUuid)).toEqual(testAchievement1);
    expect(inferencer.getTitleByUuid(newUuid)).toBe('Test Achievement 1');
    expect(inferencer.getUuidByTitle('Test Achievement 1')).toBe(newUuid);
    expect(inferencer.getAchievement(newUuid).prerequisiteUuids).toEqual(['2', '3', '4']);
    expect(inferencer.getAchievement(newUuid).goalUuids).toEqual(['1', '2']);
  });

  test('Insert new goal definition', () => {
    // Before insertion
    expect(inferencer.getAllGoals().length).toBe(mockGoals.length);
    expect(inferencer.getUuidByText('Test Goal 1')).toBeUndefined();

    const newUuid = inferencer.insertGoalDefinition(testGoal1);

    // After insertion
    expect(inferencer.getAllGoals().length).toBe(mockGoals.length + 1);
    expect(inferencer.getGoalDefinition('1')).toEqual(mockGoals[1]);
    expect(inferencer.getGoalDefinition(newUuid)).toEqual(testGoal1);
    expect(inferencer.getTextByUuid(newUuid)).toBe('Test Goal 1');
    expect(inferencer.getUuidByText('Test Goal 1')).toBe(newUuid);
  });

  test('Modify achievement', () => {
    const newUuid = inferencer.insertAchievement(testAchievement1);
    const testAchievement2: AchievementItem = {
      ...testAchievement,
      uuid: newUuid,
      title: 'Test Achievement 2'
    };

    // Before modification
    expect(inferencer.getAchievement(newUuid)).toEqual(testAchievement1);
    expect(inferencer.getTitleByUuid(newUuid)).toBe('Test Achievement 1');
    expect(inferencer.getUuidByTitle('Test Achievement 1')).toBe(newUuid);

    inferencer.modifyAchievement(testAchievement2);

    // After modification
    expect(inferencer.getAchievement(newUuid)).toEqual(testAchievement2);
    expect(inferencer.getTitleByUuid(newUuid)).toBe('Test Achievement 2');
    expect(inferencer.getUuidByTitle('Test Achievement 2')).toBe(newUuid);
  });

  test('Modify goal definition', () => {
    const newUuid = inferencer.insertGoalDefinition(testGoal1);
    const testGoal2: AchievementGoal = {
      ...testGoal,
      uuid: newUuid,
      text: 'Test Goal 2'
    };

    // Before modification
    expect(inferencer.getGoalDefinition(newUuid)).toEqual(testGoal1);
    expect(inferencer.getTextByUuid(newUuid)).toBe('Test Goal 1');
    expect(inferencer.getUuidByText('Test Goal 1')).toBe(newUuid);

    inferencer.modifyGoalDefinition(testGoal2);

    // After modification
    expect(inferencer.getGoalDefinition(newUuid)).toEqual(testGoal2);
    expect(inferencer.getTextByUuid(newUuid)).toBe('Test Goal 2');
    expect(inferencer.getUuidByText('Test Goal 2')).toBe(newUuid);
  });

  test('Remove achievement', () => {
    const { title } = inferencer.getAchievement('2');

    // Before removal
    expect(inferencer.hasAchievement('2')).toBeTruthy();
    expect(
      inferencer
        .getAllAchievements()
        .reduce(
          (hasPrereq, achievement) =>
            achievement.prerequisiteUuids.find(uuid => uuid === '2') !== undefined || hasPrereq,
          false
        )
    ).toBeTruthy();
    expect(inferencer.getTitleByUuid('2')).toBe(title);
    expect(inferencer.getUuidByTitle(title)).toBe('2');

    inferencer.removeAchievement('2');

    // After removal
    expect(inferencer.hasAchievement('2')).toBeFalsy();
    expect(
      inferencer
        .getAllAchievements()
        .reduce(
          (hasPrereq, achievement) =>
            achievement.prerequisiteUuids.find(uuid => uuid === '2') !== undefined || hasPrereq,
          false
        )
    ).toBeFalsy();
    expect(inferencer.getTitleByUuid('2')).toBe('invalid');
    expect(inferencer.getUuidByTitle(title)).toBeUndefined();
  });

  test('Remove goal definition', () => {
    const { text } = inferencer.getGoalDefinition('2');

    // Before removal
    expect(inferencer.hasGoal('2')).toBeTruthy();
    expect(
      inferencer
        .getAllAchievements()
        .reduce(
          (hasGoal, achievement) =>
            achievement.goalUuids.find(uuid => uuid === '2') !== undefined || hasGoal,
          false
        )
    ).toBeTruthy();
    expect(inferencer.getTextByUuid('2')).toBe(text);
    expect(inferencer.getUuidByText(text)).toBe('2');

    inferencer.removeGoalDefinition('2');

    // After removal
    expect(inferencer.hasGoal('2')).toBeFalsy();
    expect(
      inferencer
        .getAllAchievements()
        .reduce(
          (hasGoal, achievement) =>
            achievement.goalUuids.find(uuid => uuid === '2') !== undefined || hasGoal,
          false
        )
    ).toBeFalsy();
    expect(inferencer.getTextByUuid('2')).toBe('invalid');
    expect(inferencer.getUuidByText(text)).toBeUndefined();
  });
});

describe('Achievement Inferencer Getter', () => {
  // sorting based tests do not work with uuid implementation

  const inferencer = new AchievementInferencer(mockAchievements, mockGoals);

  test('Get all achievement IDs', () => {
    const achievementUuids = ['0', '1', '13', '16', '2', '21', '3', '4', '5', '6', '8', '9'];

    expect(inferencer.getAllAchievementUuids().sort()).toEqual(achievementUuids);
  });

  test('Get all goal IDs', () => {
    const goalUuids = ['0', '1', '11', '14', '16', '18', '2', '3', '4', '5', '8'];

    expect(inferencer.getAllGoalUuids().sort()).toEqual(goalUuids);
  });

  test('List task IDs', () => {
    const taskUuids = ['0', '1', '13', '16', '21', '4', '5', '8'];

    expect(inferencer.listTaskUuids().sort()).toEqual(taskUuids);
  });

  test('List sorted task IDs', () => {
    const sortedTaskUuids = ['1', '5', '0', '8', '21', '4', '16', '13'];

    expect(inferencer.listSortedTaskUuids()).toEqual(sortedTaskUuids);
  });

  test('List goals', () => {
    const testAchievement1: AchievementItem = {
      ...testAchievement,
      uuid: '1',
      goalUuids: ['2', '1']
    };
    const testAchievement2: AchievementItem = { ...testAchievement, uuid: '2', goalUuids: [] };

    const testGoal1: AchievementGoal = { ...testGoal, uuid: '1' };
    const testGoal2: AchievementGoal = { ...testGoal, uuid: '2' };

    const inferencer = new AchievementInferencer(
      [testAchievement1, testAchievement2],
      [testGoal1, testGoal2]
    );

    expect(inferencer.listGoals('1').length).toBe(2);
    expect(inferencer.listGoals('1')[0]).toEqual(testGoal2);
    expect(inferencer.listGoals('1')[1]).toEqual(testGoal1);
    expect(inferencer.listGoals('2')).toEqual([]);
  });

  test('List prerequisite goals', () => {
    const testAchievement1: AchievementItem = {
      ...testAchievement,
      uuid: '1',
      prerequisiteUuids: ['2']
    };
    const testAchievement2: AchievementItem = {
      ...testAchievement,
      uuid: '2',
      goalUuids: ['2', '1']
    };

    const testGoal1: AchievementGoal = { ...testGoal, uuid: '1' };
    const testGoal2: AchievementGoal = { ...testGoal, uuid: '2' };

    const inferencer = new AchievementInferencer(
      [testAchievement1, testAchievement2],
      [testGoal1, testGoal2]
    );

    expect(inferencer.listPrerequisiteGoals('1').length).toBe(2);
    expect(inferencer.listPrerequisiteGoals('1')[0]).toEqual(testGoal2);
    expect(inferencer.listPrerequisiteGoals('1')[1]).toEqual(testGoal1);
  });
});

describe('Achievement ID to Title', () => {
  const achievementUuid = '123';
  const achievementTitle = 'AcH1Ev3m3Nt t1tL3 h3R3';
  const testAchievement1: AchievementItem = {
    ...testAchievement,
    uuid: achievementUuid,
    title: achievementTitle
  };

  const inferencer = new AchievementInferencer([testAchievement1], []);

  test('Non-existing achievement ID', () => {
    expect(inferencer.getTitleByUuid('1')).toBe('invalid');
  });

  test('Existing achievement ID', () => {
    expect(inferencer.getTitleByUuid(achievementUuid)).toBe(achievementTitle);
  });

  test('Non-existing achievement title', () => {
    expect(inferencer.getUuidByTitle('IUisL0v3')).toBeUndefined();
  });

  test('Existing achievement title', () => {
    expect(inferencer.getUuidByTitle(achievementTitle)).toBe(achievementUuid);
  });
});

describe('Goal ID to Text', () => {
  const goalUuid = '123';
  const goalText = 'g0@L T3xt h3R3';
  const testGoal1: AchievementGoal = { ...testGoal, uuid: goalUuid, text: goalText };

  const inferencer = new AchievementInferencer([], [testGoal1]);

  test('Non-existing goal ID', () => {
    expect(inferencer.getTextByUuid('1')).toBe('invalid');
  });

  test('Existing goal ID', () => {
    expect(inferencer.getTextByUuid(goalUuid)).toBe(goalText);
  });

  test('Non-existing goal text', () => {
    expect(inferencer.getUuidByText('IUisL0v3')).toBeUndefined();
  });

  test('Existing goal text', () => {
    expect(inferencer.getUuidByText(goalText)).toBe(goalUuid);
  });
});

describe('Achievement Prerequisite System', () => {
  const testAchievement1: AchievementItem = {
    ...testAchievement,
    uuid: '1',
    prerequisiteUuids: ['2', '3']
  };
  const testAchievement2: AchievementItem = { ...testAchievement, uuid: '2' };
  const testAchievement3: AchievementItem = {
    ...testAchievement,
    uuid: '3',
    prerequisiteUuids: ['4']
  };
  const testAchievement4: AchievementItem = {
    ...testAchievement,
    uuid: '4',
    prerequisiteUuids: ['5']
  };
  const testAchievement5: AchievementItem = { ...testAchievement, uuid: '5' };

  const inferencer = new AchievementInferencer(
    [testAchievement1, testAchievement2, testAchievement3, testAchievement4, testAchievement5],
    []
  );

  test('Is immediate children', () => {
    expect(inferencer.isImmediateChild('1', '2')).toBeTruthy();
    expect(inferencer.isImmediateChild('1', '3')).toBeTruthy();
    expect(inferencer.isImmediateChild('1', '4')).toBeFalsy();
    expect(inferencer.isImmediateChild('1', '5')).toBeFalsy();
    expect(inferencer.isImmediateChild('1', '101')).toBeFalsy();
    expect(inferencer.isImmediateChild('101', '1')).toBeFalsy();
  });

  test('Get immediate children', () => {
    expect(inferencer.getImmediateChildren('1')).toEqual(new Set(['2', '3']));
    expect(inferencer.getImmediateChildren('2')).toEqual(new Set());
    expect(inferencer.getImmediateChildren('3')).toEqual(new Set(['4']));
    expect(inferencer.getImmediateChildren('4')).toEqual(new Set(['5']));
    expect(inferencer.getImmediateChildren('101')).toEqual(new Set());
  });

  test('Is descendant', () => {
    expect(inferencer.isDescendant('1', '2')).toBeTruthy();
    expect(inferencer.isDescendant('1', '3')).toBeTruthy();
    expect(inferencer.isDescendant('1', '4')).toBeTruthy();
    expect(inferencer.isDescendant('1', '5')).toBeTruthy();
    expect(inferencer.isDescendant('1', '101')).toBeFalsy();
    expect(inferencer.isDescendant('101', '1')).toBeFalsy();
  });

  test('Get descendants', () => {
    expect(inferencer.getDescendants('1')).toEqual(new Set(['2', '3', '4', '5']));
    expect(inferencer.getDescendants('2')).toEqual(new Set());
    expect(inferencer.getDescendants('3')).toEqual(new Set(['4', '5']));
    expect(inferencer.getDescendants('4')).toEqual(new Set(['5']));
    expect(inferencer.getDescendants('101')).toEqual(new Set());
  });

  test('List available prerequisite IDs', () => {
    expect(inferencer.listAvailablePrerequisiteUuids('1')).toEqual([]);
    expect(inferencer.listAvailablePrerequisiteUuids('2')).toEqual(['3', '4', '5']);
    expect(inferencer.listAvailablePrerequisiteUuids('3')).toEqual(['2']);
    expect(inferencer.listAvailablePrerequisiteUuids('4')).toEqual(['2']);
    expect(inferencer.listAvailablePrerequisiteUuids('5')).toEqual(['2']);
    expect(inferencer.listAvailablePrerequisiteUuids('101')).toEqual(['1', '2', '3', '4', '5']);
  });
});

describe('Achievement XP System', () => {
  const testAchievement1: AchievementItem = {
    ...testAchievement,
    uuid: '1',
    goalUuids: ['1', '3']
  };
  const testAchievement2: AchievementItem = { ...testAchievement, uuid: '2', goalUuids: [] };
  const testAchievement3: AchievementItem = { ...testAchievement, uuid: '3', goalUuids: ['3'] };

  const testGoal1: AchievementGoal = { ...testGoal, uuid: '1' };
  const testGoal2: AchievementGoal = { ...testGoal, uuid: '2' };
  const testGoal3: AchievementGoal = { ...testGoalComplete, uuid: '3' };

  const inferencer = new AchievementInferencer(
    [testAchievement1, testAchievement2, testAchievement3],
    [testGoal1, testGoal2, testGoal3]
  );

  test('XP earned from an achievement', () => {
    expect(inferencer.getAchievementXp('1')).toBe(100);
    expect(inferencer.getAchievementXp('2')).toBe(100);
    expect(inferencer.getAchievementXp('3')).toBe(100);
    expect(inferencer.getAchievementXp('101')).toBe(0);
  });

  test('Total XP earned from all achievements', () => {
    expect(inferencer.getTotalXp()).toBe(100);
  });

  test('Progress frac from an achievement', () => {
    expect(inferencer.getProgressFrac('1')).toBe(1 / 2);
    expect(inferencer.getProgressFrac('2')).toBe(0);
    expect(inferencer.getProgressFrac('3')).toBe(1);
    expect(inferencer.getProgressFrac('101')).toBe(0);
  });
});

describe('Achievement Display Deadline', () => {
  const expiredDeadline = new Date(1920, 1, 1);
  const closerExpiredDeadline = new Date(2020, 1, 1);
  const closestUnexpiredDeadline = new Date(2070, 1, 1);
  const closerUnexpiredDeadline = new Date(2120, 1, 1);
  const unexpiredDeadline = new Date(2220, 1, 1);

  const testAchievement1: AchievementItem = {
    ...testAchievement,
    uuid: '1',
    prerequisiteUuids: ['2', '5']
  };
  const testAchievement2: AchievementItem = {
    ...testAchievement,
    uuid: '2',
    prerequisiteUuids: ['3', '4']
  };
  const testAchievement3: AchievementItem = { ...testAchievement, uuid: '3' };
  const testAchievement4: AchievementItem = { ...testAchievement, uuid: '4' };
  const testAchievement5: AchievementItem = { ...testAchievement, uuid: '5' };

  test('All deadlines undefined', () => {
    const inferencer = new AchievementInferencer(
      [testAchievement1, testAchievement2, testAchievement3, testAchievement4, testAchievement5],
      []
    );

    expect(inferencer.getDisplayDeadline('1')).toBeUndefined();
    expect(inferencer.getDisplayDeadline('2')).toBeUndefined();
    expect(inferencer.getDisplayDeadline('3')).toBeUndefined();
    expect(inferencer.getDisplayDeadline('4')).toBeUndefined();
    expect(inferencer.getDisplayDeadline('5')).toBeUndefined();
    expect(inferencer.getDisplayDeadline('101')).toBeUndefined();
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

    expect(inferencer.getDisplayDeadline('1')).toEqual(expiredDeadline);
    expect(inferencer.getDisplayDeadline('2')).toEqual(expiredDeadline);
    expect(inferencer.getDisplayDeadline('3')).toEqual(expiredDeadline);
    expect(inferencer.getDisplayDeadline('4')).toEqual(expiredDeadline);
    expect(inferencer.getDisplayDeadline('5')).toEqual(expiredDeadline);
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

    expect(inferencer.getDisplayDeadline('1')).toEqual(expiredDeadline);
    expect(inferencer.getDisplayDeadline('2')).toBeUndefined();
    expect(inferencer.getDisplayDeadline('3')).toEqual(expiredDeadline);
    expect(inferencer.getDisplayDeadline('4')).toBeUndefined();
    expect(inferencer.getDisplayDeadline('5')).toEqual(closerExpiredDeadline);
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

    expect(inferencer.getDisplayDeadline('1')).toEqual(closestUnexpiredDeadline);
    expect(inferencer.getDisplayDeadline('2')).toEqual(closestUnexpiredDeadline);
    expect(inferencer.getDisplayDeadline('3')).toEqual(closestUnexpiredDeadline);
    expect(inferencer.getDisplayDeadline('4')).toEqual(unexpiredDeadline);
    expect(inferencer.getDisplayDeadline('5')).toEqual(closerUnexpiredDeadline);
  });
});

describe('Achievement Status', () => {
  const fullyCompleted: AchievementItem = { ...testAchievement, uuid: '1', goalUuids: ['1', '2'] };
  const partiallyCompleted: AchievementItem = {
    ...testAchievement,
    uuid: '2',
    goalUuids: ['1', '3']
  };
  const notCompleted: AchievementItem = { ...testAchievement, uuid: '3', goalUuids: ['3'] };
  const emptyGoal: AchievementItem = { ...testAchievement, uuid: '4', goalUuids: [] };

  const testGoal1: AchievementGoal = { ...testGoal, uuid: '1', completed: true };
  const testGoal2: AchievementGoal = { ...testGoal, uuid: '2', completed: true };
  const testGoal3: AchievementGoal = { ...testGoal, uuid: '3', completed: false };

  test('Completed status', () => {
    const inferencer = new AchievementInferencer(
      [fullyCompleted, partiallyCompleted, notCompleted, emptyGoal],
      [testGoal1, testGoal2, testGoal3]
    );

    expect(inferencer.getStatus('1')).toBe(AchievementStatus.COMPLETED);
    expect(inferencer.getStatus('2')).not.toBe(AchievementStatus.COMPLETED);
    expect(inferencer.getStatus('3')).not.toBe(AchievementStatus.COMPLETED);
    expect(inferencer.getStatus('4')).not.toBe(AchievementStatus.COMPLETED);
  });

  test('Active & Expired status', () => {
    const expiredDeadline = new Date(1920, 1, 1);
    const unexpiredDeadline = new Date(2220, 1, 1);

    const deadlineExpired: AchievementItem = { ...partiallyCompleted, deadline: expiredDeadline };
    const deadlineUnexpired: AchievementItem = { ...notCompleted, deadline: unexpiredDeadline };
    const noDeadline: AchievementItem = { ...emptyGoal, deadline: undefined };

    const inferencer = new AchievementInferencer(
      [fullyCompleted, deadlineExpired, deadlineUnexpired, noDeadline],
      [testGoal1, testGoal2, testGoal3]
    );

    expect(inferencer.getStatus('1')).not.toBe(AchievementStatus.ACTIVE);
    expect(inferencer.getStatus('2')).not.toBe(AchievementStatus.ACTIVE);
    expect(inferencer.getStatus('3')).toBe(AchievementStatus.ACTIVE);
    expect(inferencer.getStatus('4')).toBe(AchievementStatus.ACTIVE);
    expect(inferencer.getStatus('101')).toBe(AchievementStatus.ACTIVE);

    expect(inferencer.getStatus('2')).toBe(AchievementStatus.EXPIRED);
  });

  test('Unreleased status', () => {
    const expiredDeadline = new Date(1920, 1, 1);
    const unexpiredDeadline = new Date(2220, 1, 1);

    const unreleased: AchievementItem = { ...partiallyCompleted, release: unexpiredDeadline };
    const released: AchievementItem = { ...notCompleted, release: expiredDeadline };
    const precompleted: AchievementItem = { ...fullyCompleted, release: unexpiredDeadline };

    const inferencer = new AchievementInferencer(
      [unreleased, released, precompleted],
      [testGoal1, testGoal2, testGoal3]
    );

    expect(inferencer.getStatus('1')).not.toBe(AchievementStatus.UNRELEASED);
    expect(inferencer.getStatus('2')).toBe(AchievementStatus.UNRELEASED);
    expect(inferencer.getStatus('3')).not.toBe(AchievementStatus.UNRELEASED);

    expect(inferencer.getStatus('1')).toBe(AchievementStatus.COMPLETED);
    expect(inferencer.getStatus('3')).toBe(AchievementStatus.ACTIVE);
  });
});

describe('Achievement Position', () => {
  const listPositions = () =>
    inferencer
      .getAllAchievements()
      .filter(achievement => achievement.position !== 0)
      .map(achievement => achievement.position)
      .sort((a, b) => a - b);
  const mockPositions = [1, 2, 3, 4, 5, 6];

  const inferencer = new AchievementInferencer(mockAchievements, mockGoals);

  test('Mock achievement positions', () => {
    expect(listPositions()).toEqual(mockPositions);
  });

  test('Insert non-task', () => {
    const testAchievement1: AchievementItem = { ...testAchievement, isTask: false };

    inferencer.insertAchievement(testAchievement1);

    expect(listPositions()).toEqual(mockPositions);
  });

  test('Insert task', () => {
    const testAchievement1: AchievementItem = { ...testAchievement, isTask: true };

    const newUuid = inferencer.insertAchievement(testAchievement1);

    expect(inferencer.getAchievement(newUuid).position).toBe(1);
    expect(listPositions()).toEqual([...mockPositions, 7]);

    inferencer.removeAchievement(newUuid);
  });

  test('Insert task with anchor position', () => {
    const testAchievement1: AchievementItem = { ...testAchievement, isTask: true, position: 3 };

    const newUuid = inferencer.insertAchievement(testAchievement1);

    expect(inferencer.getAchievement(newUuid).position).toBe(3);
    expect(listPositions()).toEqual([...mockPositions, 7]);

    inferencer.removeAchievement(newUuid);
  });

  test('Modify task with anchor position', () => {
    const testAchievement1: AchievementItem = { ...testAchievement, isTask: true, position: 3 };

    const newUuid = inferencer.insertAchievement(testAchievement1);

    inferencer.modifyAchievement({ ...testAchievement1, position: 2 });
    expect(inferencer.getAchievement(newUuid).position).toBe(2);

    inferencer.modifyAchievement({ ...testAchievement1, position: 7 });
    expect(inferencer.getAchievement(newUuid).position).toBe(7);

    inferencer.modifyAchievement({ ...testAchievement1, position: 10 });
    expect(inferencer.getAchievement(newUuid).position).toBe(7);
    expect(listPositions()).toEqual([...mockPositions, 7]);

    inferencer.modifyAchievement({ ...testAchievement1, isTask: false, position: 0 });
    expect(inferencer.getAchievement(newUuid).position).toBe(0);
    expect(listPositions()).toEqual(mockPositions);

    inferencer.removeAchievement(newUuid);
  });

  test('Remove task', () => {
    const testAchievement1: AchievementItem = { ...testAchievement, isTask: true, position: 4 };

    const newUuid = inferencer.insertAchievement(testAchievement1);

    //Before removal
    expect(inferencer.getAchievement(newUuid).position).toBe(4);
    expect(listPositions()).toEqual([...mockPositions, 7]);

    inferencer.removeAchievement(newUuid);

    //After removal
    expect(listPositions()).toEqual(mockPositions);
  });

  test('Remove non-task', () => {
    const testAchievement1: AchievementItem = { ...testAchievement, isTask: true, position: 4 };
    const testAchievement2: AchievementItem = { ...testAchievement, uuid: '1' };

    const newUuid = inferencer.insertAchievement(testAchievement1);
    inferencer.modifyAchievement(testAchievement2);

    //Before removal
    expect(inferencer.getAchievement(newUuid).position).toBe(4);
    expect(listPositions()).toEqual([...mockPositions, 7]);

    inferencer.removeAchievement('1');

    //After removal
    expect(inferencer.getAchievement(newUuid).position).toBe(4);
    expect(listPositions()).toEqual([...mockPositions, 7]);
  });
});
