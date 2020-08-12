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
  test('an achievement is inserted and deleted', () => {
    const inferencer = new AchievementInferencer(mockAchievements, mockGoals);

    inferencer.insertAchievement(sampleAchievement);
    expect(inferencer.getAllAchievement().length).toEqual(13);

    expect(inferencer.doesAchievementExist(sampleAchievement.id)).toEqual(true);
    expect(inferencer.getAchievementItem(sampleAchievement.id)).toEqual(sampleAchievement);

    inferencer.removeAchievement(sampleAchievement.id);
    expect(inferencer.getAllAchievement().length).toEqual(12);
  });
});
