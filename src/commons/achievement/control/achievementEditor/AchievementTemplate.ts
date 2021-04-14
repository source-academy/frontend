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
  uuid: '',
  title: 'Achievement Title Here',
  ability: AchievementAbility.CORE,
  xp: 0,
  isTask: false,
  position: 0,
  prerequisiteUuids: [],
  goalUuids: [],
  cardBackground: `${cardBackgroundUrl}/default.png`,
  view: viewTemplate
};
