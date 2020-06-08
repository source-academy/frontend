import * as Phaser from 'phaser';

import GameManager from './GameManager';

const phaserGame = {
  height: 1080,
  physics: {
    default: 'arcade'
  },
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'game-display'
  },
  scene: [GameManager],
  type: Phaser.CANVAS,
  width: 1920
};

export default phaserGame;
