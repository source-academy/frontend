import {
  AchievementAbility,
  AchievementItem
} from '../../../../features/achievement/AchievementTypes';
import { mockAchievements, mockGoals } from '../../../mocks/AchievementMocks';
import AchievementInferencer from '../AchievementInferencer';

const sampleAchievement: AchievementItem = {
  id: 12,
  title: 'New Achievement',
  ability: AchievementAbility.CORE,
  isTask: false,
  prerequisiteIds: [],
  goalIds: [],
  position: 0,
  cardTileUrl:
    'https://www.publicdomainpictures.net/pictures/30000/velka/plain-white-background.jpg',
  view: {
    canvasUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/canvas/annotated-canvas.png',
    description: '',
    completionText: ''
  }
};

describe('Achievements change when', () => {
  test('an achievement is unset to be a task', () => {
    const inferencer = new AchievementInferencer(mockAchievements, mockGoals);
    inferencer.setNonTask(inferencer.getAchievementItem(0));

    expect(inferencer.getAchievementItem(0).isTask).toEqual(false);
    expect(inferencer.getAchievementItem(0).position).toEqual(0);
    expect(inferencer.getAchievementItem(0).prerequisiteIds).toEqual([]);
  });

  test('an achievement is set to be a task', () => {
    const inferencer = new AchievementInferencer(mockAchievements, mockGoals);
    inferencer.setTask(inferencer.getAchievementItem(0));

    expect(inferencer.getAchievementItem(0).isTask).toEqual(true);
    expect(inferencer.getAchievementItem(0).position).toEqual(inferencer.listTaskIds().length);
  });

  test('an achievement is inserted and deleted', () => {
    const inferencer = new AchievementInferencer(mockAchievements, mockGoals);

    inferencer.insertAchievement(sampleAchievement);
    expect(inferencer.getAchievements().length).toEqual(13);

    expect(inferencer.doesAchievementExist(sampleAchievement.id)).toEqual(true);
    expect(inferencer.getAchievementItem(sampleAchievement.id)).toEqual(sampleAchievement);

    inferencer.removeAchievement(sampleAchievement.id);
    expect(inferencer.getAchievements().length).toEqual(12);
  });

  test('an achievement swaps position', () => {
    const inferencer = new AchievementInferencer(mockAchievements, mockGoals);
    const firstTask = inferencer.getAchievementItem(4);

    inferencer.changeAchievementPosition(firstTask, 2);

    expect(inferencer.getAchievementItem(firstTask.id).position).toEqual(2);
  });
});

describe('Children are listed', () => {
  test('to test if they are immediate', () => {
    const inferencer = new AchievementInferencer(mockAchievements, mockGoals);
    const firstAchievementId = inferencer.getAchievementItem(0).id;
    const secondAchievementId = inferencer.getAchievementItem(1).id;

    expect(inferencer.isImmediateChild(firstAchievementId, secondAchievementId)).toEqual(false);
  });

  test('if listImmediateChildren is called', () => {
    const inferencer = new AchievementInferencer(mockAchievements, mockGoals);
    const firstAchievementId = inferencer.getAchievementItem(0).id;

    expect([...inferencer.getImmediateChildren(firstAchievementId)]).toEqual([]);
  });
});
