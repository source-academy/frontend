import {
  AchievementItem,
  AchievementAbility,
  AchievementModalItem
} from '../../../../../commons/achievements/AchievementTypes';

export const modalTemplate: AchievementModalItem = {
  modalImageUrl:
    'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/sourceAcademy%40x2.png',
  description: 'Modal Description here',
  completionText: 'Completion Text here'
};

export const achievementTemplate: AchievementItem = {
  id: 0,
  title: '',
  ability: AchievementAbility.CORE,
  deadline: new Date(),
  isTask: false,
  release: new Date(),
  prerequisiteIds: [],
  goals: [
    {
      goalId: 0,
      goalText: 'Sample GOal',
      goalProgress: 0,
      goalTarget: 0
    }
  ],
  position: 0,
  backgroundImageUrl:
    'https://www.publicdomainpictures.net/pictures/30000/velka/plain-white-background.jpg',
  modal: modalTemplate
};
