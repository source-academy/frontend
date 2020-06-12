import * as Phaser from 'phaser';
import { Constants as c } from '../../../../features/game/commons/CommonConstants';
import GameManager from './GameManager';
// import StoryChapterSelect from '../../../../features/game/storyChapterSelect/StoryChapterSelect';

const config = {
  debug: true,
  type: Phaser.WEBGL,
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
