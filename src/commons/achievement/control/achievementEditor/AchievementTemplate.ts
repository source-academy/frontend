import {
  cardBackgroundUrl,
  coverImageUrl
} from '../../../../features/achievement/AchievementConstants';
import {
  AchievementAbility,
  AchievementItem,
  AchievementView
} from '../../../../features/achievement/AchievementTypes';

export const viewTemplate: AchievementView = {
  coverImage: `${coverImageUrl}/default.png`,
  description: '',
  completionText: ''
};

export const achievementTemplate: AchievementItem = {
  id: -1,
  title: 'Achievement Title Here',
  ability: AchievementAbility.CORE,
  isTask: false,
  position: 0,
  prerequisiteIds: [],
  goalIds: [],
  cardBackground: `${cardBackgroundUrl}/default.png`,
  view: viewTemplate
};
