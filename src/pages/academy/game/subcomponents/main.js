import * as Phaser from 'phaser';
import StoryChapterSelect from './storyChapterSelect';

const phaserGame = {
  type: Phaser.CANVAS,
  width: 1920,
  height: 1080,
  physics: {
    default: 'arcade'
  },
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'game-display'
  },
  scene: [StoryChapterSelect] /* Replace with scene objects that you imported */
};

export default phaserGame;
