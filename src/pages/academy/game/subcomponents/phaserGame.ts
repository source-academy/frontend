import * as Phaser from 'phaser';

import StoryChapterSelect from './scenes/storyChapterSelect';

const phaserGame = {
  height: 1080,
  physics: {
    default: 'arcade'
  },
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'game-display'
  },
  scene: [StoryChapterSelect] /* Replace with scene objects that you imported */,
  type: Phaser.CANVAS,
  width: 1920
};

export default phaserGame;
