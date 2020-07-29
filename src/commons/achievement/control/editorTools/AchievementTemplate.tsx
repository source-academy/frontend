import { canvasUrl, cardTileUrl } from '../../../../features/achievement/AchievementConstants';
import {
  AchievementAbility,
  AchievementItem,
  AchievementViewItem
} from '../../../../features/achievement/AchievementTypes';

export const viewTemplate: AchievementViewItem = {
  canvasUrl: `${canvasUrl}/annotated-canvas.png`,
  description: 'View Description here',
  completionText: 'Completion Text here'
};

export const achievementTemplate: AchievementItem = {
  id: 0,
  title: '',
  ability: AchievementAbility.CORE,
  deadline: new Date(),
  isTask: false,
  release: new Date(),
  prerequisiteIds: [],
  goals: [
    {
      goalId: 0,
      goalText: 'Sample Goal',
      goalProgress: 0,
      goalTarget: 0
    }
  ],
  position: 0,
  cardTileUrl: `${cardTileUrl}/annotated-tile.png`,
  view: viewTemplate
};
