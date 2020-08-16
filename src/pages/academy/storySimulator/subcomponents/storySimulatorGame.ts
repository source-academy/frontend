import * as Phaser from 'phaser';
import { screenSize } from 'src/features/game/commons/CommonConstants';
import CheckpointTransition from 'src/features/game/scenes/checkpointTransition/CheckpointTransition';
import GameManager from 'src/features/game/scenes/gameManager/GameManager';
import SourceAcademyGame, { GameType } from 'src/features/game/SourceAcademyGame';
import MainMenu from 'src/features/storySimulator/scenes/mainMenu/MainMenu';
import ObjectPlacement from 'src/features/storySimulator/scenes/ObjectPlacement/ObjectPlacement';

const config = {
  debug: true,
  type: Phaser.CANVAS,
  width: screenSize.x,
  height: screenSize.y,
  physics: {
    default: 'arcade'
  },
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'game-display'
  },
  fps: {
    target: 24
  }
};

export const createStorySimulatorGame = () => {
  const game = new SourceAcademyGame(config, GameType.Simulator);
  game.scene.add('StorySimulatorMenu', MainMenu, true);
  game.scene.add('ObjectPlacement', ObjectPlacement);
  game.scene.add('GameManager', GameManager);
  game.scene.add('CheckpointTransition', CheckpointTransition);
  return game;
};
