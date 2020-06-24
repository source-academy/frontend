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
  },
  scene: [StorySimulatorMenu, StorySimulatorTransition, GameManager]
};

let storySimualtorGame: SourceAcademyGame;
export const getStorySimulatorGame = () => {
  return storySimualtorGame;
};

export const createStorySimulatorGame = () => {
  storySimualtorGame = new SourceAcademyGame(config);
};
