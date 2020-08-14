import { canvasUrl, cardTileUrl } from '../../../../features/achievement/AchievementConstants';
import {
  AchievementAbility,
  AchievementItem,
  AchievementView
} from '../../../../features/achievement/AchievementTypes';

export const viewTemplate: AchievementView = {
  canvasUrl: `${canvasUrl}/default-canvas.png`,
  description: 'View Description here',
  completionText: 'Completion Text here'
};

export const achievementTemplate: AchievementItem = {
  id: 0,
  title: 'Achievement Title Here',
  ability: AchievementAbility.CORE,
  isTask: false,
  position: 0,
  prerequisiteIds: [],
  goalIds: [],
  cardTileUrl: `${cardTileUrl}/default-tile.png`,
  view: viewTemplate
};
