import { canvasUrl, cardTileUrl } from 'src/features/achievement/AchievementConstants';

import {
  AchievementAbility,
  AchievementItem,
  AchievementModalItem
} from '../../../../../features/achievement/AchievementTypes';

export const modalTemplate: AchievementModalItem = {
  modalImageUrl: `${canvasUrl}/annotated-canvas.png`,
  description: 'Modal Description here',
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
  backgroundImageUrl: `${cardTileUrl}/annotated-tile.png`,
  modal: modalTemplate
};
