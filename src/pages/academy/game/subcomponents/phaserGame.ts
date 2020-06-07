import * as Phaser from 'phaser';
import { Constants as c } from './utils/constants';
import { PhaserGame } from './utils/extendedPhaser';
import StoryChapterSelect from './scenes/StoryChapterSelect';

const config = {
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
  }
};

const game = new PhaserGame(config);
game.sceneAdd(() => console.log('hello'), 'storyChapterSelect', StoryChapterSelect, true);
export default game;
