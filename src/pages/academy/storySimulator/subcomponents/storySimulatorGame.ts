import * as Phaser from 'phaser';
import { screenSize } from '../../../../features/game/commons/CommonConstants';
import GameManager from 'src/features/game/scenes/gameManager/GameManager';
import { SourceAcademyGame } from '../../game/subcomponents/sourceAcademyGame';
import StorySimulatorTransition from 'src/features/storySimulator/scenes/StorySimulatorTransition';
import StorySimulatorMenu from 'src/features/storySimulator/scenes/StorySimulatorMenu';

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

let storySimulatorGame: SourceAcademyGame;
export const getStorySimulatorGame = () => {
  return storySimulatorGame;
};

export const createStorySimulatorGame = () => {
  storySimulatorGame = new SourceAcademyGame(config);
  storySimulatorGame.scene.add('StorySimulatorMenu', StorySimulatorMenu, true);
  storySimulatorGame.scene.add('StorySimulatorTransition', StorySimulatorTransition);
  storySimulatorGame.scene.add('GameManager', GameManager);
};
