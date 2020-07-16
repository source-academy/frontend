import { FilterStatus } from 'src/commons/achievements/AchievementTypes';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';

import Inferencer from '../Inferencer';

describe('Achievements change when', () => {
  test('an achievement is set to be a task', () => {
    const inferencer = new Inferencer(mockAchievements);
    inferencer.setTask(inferencer.getAchievementItem(0));

    expect(inferencer.getAchievementItem(0).isTask).toEqual(true);
  });
  test('an achievement is unset to be a task', () => {
    const inferencer = new Inferencer(mockAchievements);
    inferencer.setNonTask(inferencer.getAchievementItem(0));

    expect(inferencer.getAchievementItem(0).isTask).toEqual(false);
  });
});

describe('Children are listed', () => {
  test('to test if they are immediate', () => {
    const inferencer = new Inferencer(mockAchievements);
    const firstAchievementId = inferencer.getAchievementItem(0).id;
    const secondAchievementId = inferencer.getAchievementItem(1).id;

    expect(inferencer.isImmediateChild(firstAchievementId, secondAchievementId)).toEqual(false);
  });

  test('if listImmediateChildren is called', () => {
    const inferencer = new Inferencer(mockAchievements);
    const firstAchievementId = inferencer.getAchievementItem(0).id;

    expect(inferencer.listImmediateChildren(firstAchievementId)).toEqual([]);
  });
});

describe('Filter Count activated when', () => {
  test('getFilterCount is called', () => {
    const inferencer = new Inferencer(mockAchievements);
    expect(inferencer.getFilterCount(FilterStatus.COMPLETED)).toEqual(1);
  });
});
