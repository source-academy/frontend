import * as Phaser from 'phaser';
import { screenSize } from 'src/features/game/commons/CommonConstants';

import { dateOneYearFromNow } from './GameSimulatorUtils';

export const gameSimConfig = {
  debug: true,
  type: Phaser.CANVAS,
  width: screenSize.x,
  height: screenSize.y,
  physics: {
    default: 'arcade'
  },
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'game-display'
  },
  fps: {
    target: 24
  }
};

export const defaultChapter = {
  id: -1,
  title: '',
  imageUrl: '/locations/spaceshipBackground.png',
  openAt: new Date().toISOString(),
  closeAt: dateOneYearFromNow(new Date()).toISOString(),
  isPublished: false,
  filenames: []
};
