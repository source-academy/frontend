import {
  AchievementItem,
  AchievementAbility,
  AchievementModalItem
} from '../../../../../commons/achievements/AchievementTypes';

export const modalTemplate: AchievementModalItem = {
  modalImageUrl:
    'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/sourceAcademy%40x2.png',
  description: 'Modal Description here',
  goalText: 'Goal Text here',
  completionText: 'Completion Text here'
};

export const achievementTemplate: AchievementItem = {
  id: 0,
  title: '',
  ability: AchievementAbility.ACADEMIC,
  deadline: new Date(),
  exp: 0,
  isTask: false,
  release: new Date(),
  prerequisiteIds: [],
  completionGoal: 0,
  completionProgress: 0,
  position: 0,
  backgroundImageUrl:
    'https://www.publicdomainpictures.net/pictures/30000/velka/plain-white-background.jpg',
  modal: modalTemplate
};
