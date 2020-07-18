import {
  AchievementAbility,
  AchievementItem,
  FilterStatus
} from 'src/commons/achievement/AchievementTypes';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';

import AchievementInferencer from '../AchievementInferencer';

const sampleAchievement: AchievementItem = {
  id: 11,
  title: 'Sample Title',
  ability: AchievementAbility.CORE,
  isTask: false,
  prerequisiteIds: [],
  goals: [],
  position: 0,
  backgroundImageUrl:
    'https://www.publicdomainpictures.net/pictures/30000/velka/plain-white-background.jpg',
  modal: {
    modalImageUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/canvas/annotated-canvas.png',
    description: '',
    completionText: ''
  }
};

describe('Achievements change when', () => {
  test('an achievement is set to be a task', () => {
    const inferencer = new AchievementInferencer(mockAchievements);
    inferencer.setTask(inferencer.getAchievementItem(0));

    expect(inferencer.getAchievementItem(0).isTask).toEqual(true);
  });

  test('an achievement is unset to be a task', () => {
    const inferencer = new AchievementInferencer(mockAchievements);
    inferencer.setNonTask(inferencer.getAchievementItem(0));

    expect(inferencer.getAchievementItem(0).isTask).toEqual(false);
  });

  test('an achievement is inserted and deleted', () => {
    const inferencer = new AchievementInferencer(mockAchievements);

    inferencer.insertAchievement(sampleAchievement);
    expect(inferencer.getAchievements().length).toEqual(13);

    inferencer.removeAchievement(0);
    expect(inferencer.getAchievements().length).toEqual(12);
  });
});

describe('Children are listed', () => {
  test('to test if they are immediate', () => {
    const inferencer = new AchievementInferencer(mockAchievements);
    const firstAchievementId = inferencer.getAchievementItem(0).id;
    const secondAchievementId = inferencer.getAchievementItem(1).id;

    expect(inferencer.isImmediateChild(firstAchievementId, secondAchievementId)).toEqual(false);
  });

  test('if listImmediateChildren is called', () => {
    const inferencer = new AchievementInferencer(mockAchievements);
    const firstAchievementId = inferencer.getAchievementItem(0).id;

    expect(inferencer.listImmediateChildren(firstAchievementId)).toEqual([]);
  });
});

describe('Filter Count activated when', () => {
  test('getFilterCount is called', () => {
    const inferencer = new AchievementInferencer(mockAchievements);
    expect(inferencer.getFilterCount(FilterStatus.COMPLETED)).toEqual(1);

    expect(inferencer.getFilterCount(FilterStatus.ACTIVE)).toEqual(7);

    expect(inferencer.getFilterCount(FilterStatus.ALL)).toEqual(8);
  });
});
