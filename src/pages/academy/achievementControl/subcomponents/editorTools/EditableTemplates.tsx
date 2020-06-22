import {
  AchievementItem,
  AchievementAbility,
  AchievementStatus,
  AchievementModalItem
} from 'src/commons/achievements/AchievementTypes';

export const achievementTemplate: AchievementItem = {
  id: 0,
  title: '',
  ability: AchievementAbility.ACADEMIC,
  exp: 0,
  isTask: true,
  prerequisiteIds: [],
  status: AchievementStatus.ACTIVE,
  completionGoal: 0,
  completionProgress: 0
};

export const modalTemplate: AchievementModalItem = {
  modalImageUrl:
    'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/sourceAcademy%40x2.png',
  description: 'Modal Description here.',
  goalText: 'Goal Text here.',
  completionText: 'Completion Text here.'
};
