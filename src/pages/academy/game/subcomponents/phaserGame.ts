import * as Phaser from 'phaser';
import { screenSize } from '../../../../features/game/commons/CommonConstants';
// import StoryChapterSelect from 'src/features/game/storyChapterSelect/StoryChapterSelect';
// import GameManager from './GameManager';
// import StoryChapterSelect from '../../../../features/game/storyChapterSelect/StoryChapterSelect';

const config = {
  debug: true,
  type: Phaser.WEBGL,
  width: screenSize.x,
  height: screenSize.y,
  physics: {
    default: 'arcade'
  },
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'game-display'
  }
};

const phaserGame = new Phaser.Game(config);

export default phaserGame;
