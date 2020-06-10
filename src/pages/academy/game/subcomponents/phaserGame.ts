import * as Phaser from 'phaser';
import { Constants as c } from './utils/constants';
// import PlayGame from './scenes/PlayGame';
import GameManager from './GameManager';

const config = {
  debug: true,
  type: Phaser.CANVAS,
  width: c.screenWidth,
  height: c.screenHeight,
  physics: {
    default: 'arcade'
  },
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'game-display'
  },
  scene: [GameManager]
};

const phaserGame = new Phaser.Game(config);
export default phaserGame;
