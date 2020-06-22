import GameActionManager from '../action/GameActionManager';
import { mediumButton, escapeMenuBackground } from '../commons/CommonAssets';
import { screenSize, screenCenter } from '../commons/CommonConstants';
import { createButton } from '../utils/StyleUtils';
import {
  escapeOptButtonStyle,
  escapeTextOriX,
  escapeTextOriY,
  escapeButtonYPos,
  volumeRadioOptTextStyle,
  optTextStyle,
  optHeaderTextXPos,
  optHeaderTextYPos,
  radioButtonsXSpace,
  volumeOptXPos,
  volumeOptYPos,
  volumeOptTextAnchorX,
  volumeOptTextAnchorY,
  volumeOptTextXOffset,
  volumeOptTextYOffset
} from './GameEscapeConstants';
import { Layer } from '../layer/GameLayerTypes';
import CommonRadioButtons from '../commons/CommonRadioButtons';
import { volumeContainerOptions, volumeDefaultOpt } from '../scenes/settings/SettingsConstants';

class GameEscapeManager {
  private volumeOptions: CommonRadioButtons | undefined;

  constructor() {
    this.volumeOptions = undefined;
  }

  public createEscapeMenu() {
    const gameManager = GameActionManager.getInstance().getGameManager();

    const escapeMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);
    const escapeMenuBg = new Phaser.GameObjects.Image(
      gameManager,
      screenCenter.x,
      screenCenter.y,
      escapeMenuBackground.key
    );
    escapeMenuBg.setDisplaySize(screenSize.x, screenSize.y);
    escapeMenuBg.setInteractive({ pixelPerfect: true });

    const volumeText = new Phaser.GameObjects.Text(
      gameManager,
      optHeaderTextXPos,
      optHeaderTextYPos,
      'Volume',
      optTextStyle
    );

    this.volumeOptions = new CommonRadioButtons(
      gameManager,
      volumeContainerOptions,
      volumeDefaultOpt, // TODO: Use previous setting
      radioButtonsXSpace,
      volumeRadioOptTextStyle,
      volumeOptXPos,
      volumeOptYPos,
      volumeOptTextAnchorX,
      volumeOptTextAnchorY,
      15,
      3,
      10,
      volumeOptTextXOffset,
      volumeOptTextYOffset
    );

    const mainMenuButton = createButton(
      gameManager,
      'Main Menu',
      () => {
        gameManager.layerManager.clearAllLayers();
        gameManager.scene.start('MainMenu');
      },
      mediumButton.key,
      { x: screenSize.x * 0.25, y: escapeButtonYPos },
      escapeTextOriX,
      escapeTextOriY,
      escapeOptButtonStyle
    );

    const continueButton = createButton(
      gameManager,
      'Continue',
      () => GameActionManager.getInstance().getGameManager().phaseManager.popPhase(),
      mediumButton.key,
      { x: screenSize.x * 0.5, y: escapeButtonYPos },
      escapeTextOriX,
      escapeTextOriY,
      escapeOptButtonStyle
    );

    const applySettingsButton = createButton(
      gameManager,
      'Apply Settings',
      () => {
        GameActionManager.getInstance().saveGame();
      },
      mediumButton.key,
      { x: screenSize.x * 0.75, y: escapeButtonYPos },
      escapeTextOriX,
      escapeTextOriY,
      escapeOptButtonStyle
    );

    escapeMenuContainer.add([
      escapeMenuBg,
      volumeText,
      this.volumeOptions,
      mainMenuButton,
      continueButton,
      applySettingsButton
    ]);
    GameActionManager.getInstance().addContainerToLayer(Layer.Escape, escapeMenuContainer);
  }

  public destroyEscapeMenu() {
    GameActionManager.getInstance()
      .getGameManager()
      .layerManager.clearSeveralLayers([Layer.Escape]);
  }
}

export default GameEscapeManager;
