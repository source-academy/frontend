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
  exp: 0,
  isTask: false,
  prerequisiteIds: [],
  completionGoal: 0,
  completionProgress: 0,
  position: 0,
  modal: modalTemplate
};
