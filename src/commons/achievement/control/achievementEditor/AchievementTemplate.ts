import {
  cardBackgroundUrl,
  coverImageUrl
} from 'src/features/achievement/AchievementConstants';
import {
  AchievementItem,
  AchievementView
} from 'src/features/achievement/AchievementTypes';

export const viewTemplate: AchievementView = {
  coverImage: `${coverImageUrl}/default.png`,
  description: '',
  completionText: ''
};

export const achievementTemplate: AchievementItem = {
  uuid: '',
  title: 'Achievement Title Here',
  xp: 0,
  isVariableXp: false,
  isTask: false,
  position: 0,
  prerequisiteUuids: [],
  goalUuids: [],
  cardBackground: `${cardBackgroundUrl}/default.png`,
  view: viewTemplate
};
