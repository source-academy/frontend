import {
  AchievementItem,
  AchievementAbility,
  AchievementStatus,
  AchievementModalItem
} from 'src/commons/achievements/AchievementTypes';
import { achievementDict } from 'src/commons/mocks/AchievementMocks';

export const achievementTemplate: AchievementItem = {
  id: Object.keys(achievementDict).length,
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
  id: 0,
  title: 'Modal Title here',
  modalImageUrl:
    'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/sourceAcademy%40x2.png',
  description: 'Modal Description here.',
  exp: 0,
  goalText: 'Goal Text here.',
  completionText: 'Completion Text here.'
};
