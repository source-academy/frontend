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
import CommonRadioButtons from '../commons/CommonRadioButtons';
import { volumeContainerOptions } from '../scenes/settings/SettingsConstants';
import { GamePhaseType } from '../phase/GamePhaseTypes';
import { Layer } from '../layer/GameLayerTypes';
import GameManager from '../scenes/gameManager/GameManager';

class GameEscapeManager {
  private volumeOptions: CommonRadioButtons | undefined;
  private scene: GameManager;

  constructor(scene: GameManager) {
    this.scene = scene;
    this.volumeOptions = undefined;
  }

  public createEscapeMenu() {
    const gameManager = this.scene;
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

    const userVol = this.scene.getSaveManager().getLoadedUserState().settings.volume;
    const userVolIdx = volumeContainerOptions.findIndex(value => parseFloat(value) === userVol);
    this.volumeOptions = new CommonRadioButtons(
      gameManager,
      volumeContainerOptions,
      userVolIdx,
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
        gameManager.cleanUp();
        if (gameManager.isStorySimulator) {
          gameManager.scene.start('StorySimulatorMenu');
        } else {
          gameManager.scene.start('MainMenu');
        }
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
      async () => {
        if (gameManager.getPhaseManager().isCurrentPhase(GamePhaseType.EscapeMenu)) {
          await gameManager.getPhaseManager().popPhase();
        }
      },
      mediumButton.key,
      { x: screenSize.x * 0.5, y: escapeButtonYPos },
      escapeTextOriX,
      escapeTextOriY,
      escapeOptButtonStyle
    );

    const applySettingsButton = createButton(
      gameManager,
      'Apply Settings',
      () => this.applySettings(),
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
    this.scene.getLayerManager().addToLayer(Layer.Escape, escapeMenuContainer);
  }

  public destroyEscapeMenu() {
    this.scene.getLayerManager().clearSeveralLayers([Layer.Escape]);
  }

  private async applySettings() {
    if (this.volumeOptions) {
      // Save settings
      const volumeVal = parseFloat(this.volumeOptions.getChosenChoice());
      await this.scene.getSaveManager().saveSettings({ volume: volumeVal });

      // Apply settings
      const newUserSetting = this.scene.getSaveManager().getLoadedUserState();
      this.scene.getSoundManager().applyUserSettings(newUserSetting);
    }
  }
}

export default GameEscapeManager;
