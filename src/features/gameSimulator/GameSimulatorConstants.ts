import * as Phaser from 'phaser';
import { screenSize } from 'src/features/game/commons/CommonConstants';

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
