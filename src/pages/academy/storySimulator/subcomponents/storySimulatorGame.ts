import * as Phaser from 'phaser';
import { screenSize } from '../../../../features/game/commons/CommonConstants';
import GameManager from 'src/features/game/scenes/gameManager/GameManager';
import { SourceAcademyGame } from '../../game/subcomponents/sourceAcademyGame';
import StorySimulatorMenu from 'src/features/storySimulator/scenes/StorySimulatorMenu/StorySimulatorMenu';
import ObjectPlacement from 'src/features/storySimulator/scenes/ObjectPlacement/ObjectPlacement';

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
  storySimulatorGame.scene.add('ObjectPlacement', ObjectPlacement);
  storySimulatorGame.scene.add('GameManager', GameManager);
};
