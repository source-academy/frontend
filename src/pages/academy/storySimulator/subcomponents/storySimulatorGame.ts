import * as Phaser from 'phaser';
import GameManager from 'src/features/game/scenes/gameManager/GameManager';
import MainMenu from 'src/features/storySimulator/scenes/mainMenu/MainMenu';
import ObjectPlacement from 'src/features/storySimulator/scenes/ObjectPlacement/ObjectPlacement';

import { screenSize } from '../../../../features/game/commons/CommonConstants';
import SourceAcademyGame, { GameType } from '../../game/subcomponents/SourceAcademyGame';

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

export const createStorySimulatorGame = () => {
  const game = new SourceAcademyGame(config, GameType.Simulator);
  game.scene.add('StorySimulatorMenu', MainMenu, true);
  game.scene.add('ObjectPlacement', ObjectPlacement);
  game.scene.add('GameManager', GameManager);
  return game;
};
