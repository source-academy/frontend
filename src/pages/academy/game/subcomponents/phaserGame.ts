import * as Phaser from 'phaser';
import { Constants as c } from './utils/constants';
import PlayGame from './scenes/PlayGame';

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
  dom: {
    createContainer: true
  },
  scene: [PlayGame]
};

const phaserGame = new Phaser.Game(config);
export default phaserGame;
