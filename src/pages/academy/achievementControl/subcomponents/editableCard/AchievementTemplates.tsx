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
  isTask: true,
  status: AchievementStatus.ACTIVE,
  completionGoal: 0
};

export const modalTemplate: AchievementModalItem = {
  id: 1,
  title: '',
  modalImageUrl:
    'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/robotDog%40x2.png',
  description: 'Cookies!',
  exp: 200,
  goalText: 'Complete Beyond the Second Dimension & Colorful Carpet missions.',
  completionText: 'Cooooookiess!!!'
};
