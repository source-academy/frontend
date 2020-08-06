import { canvasUrl, cardTileUrl } from '../../../../features/achievement/AchievementConstants';
import {
  AchievementAbility,
  AchievementItem,
  AchievementView
} from '../../../../features/achievement/AchievementTypes';

export const viewTemplate: AchievementView = {
  canvasUrl: `${canvasUrl}/annotated-canvas.png`,
  description: 'View Description here',
  completionText: 'Completion Text here'
};

export const achievementTemplate: AchievementItem = {
  id: 0,
  title: '',
  ability: AchievementAbility.CORE,
  isTask: false,
  position: 0,
  prerequisiteIds: [],
  goalIds: [],
  cardTileUrl: `${cardTileUrl}/annotated-tile.png`,
  view: viewTemplate
};
