import GameActionManager from '../action/GameActionManager';
import { screenSize, screenCenter } from '../commons/CommonConstants';
import { createButton } from '../utils/StyleUtils';
import escapeConstants, {
  escapeOptButtonStyle,
  volumeRadioOptTextStyle,
  optTextStyle
} from './GameEscapeConstants';
import { Layer } from '../layer/GameLayerTypes';
import CommonRadioButtons from '../commons/CommonRadioButtons';
import settingsConstants from '../scenes/settings/SettingsConstants';
import { GamePhaseType } from '../phase/GamePhaseTypes';
import { IGameUI } from '../commons/CommonTypes';
import { createBitmapText } from '../utils/TextUtils';
import ImageAssets from '../assets/ImageAssets';

class GameEscapeManager implements IGameUI {
  private volumeOptions: CommonRadioButtons | undefined;

  constructor() {
    this.volumeOptions = undefined;
  }

  public activateUI() {
    const gameManager = GameActionManager.getInstance().getGameManager();

    const escapeMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);
    const escapeMenuBg = new Phaser.GameObjects.Image(
      gameManager,
      screenCenter.x,
      screenCenter.y,
      ImageAssets.escapeMenuBackground.key
    );
    escapeMenuBg.setDisplaySize(screenSize.x, screenSize.y);
    escapeMenuBg.setInteractive({ pixelPerfect: true });

    const volumeText = createBitmapText(
      gameManager,
      'Volume',
      escapeConstants.optTextXPos,
      escapeConstants.optTextYPos,
      optTextStyle
    );

    const userVol = GameActionManager.getInstance()
      .getGameManager()
      .saveManager.getLoadedUserState().settings.volume;
    const userVolIdx = settingsConstants.volContainerOpts.findIndex(
      value => parseFloat(value) === userVol
    );
    this.volumeOptions = new CommonRadioButtons(
      gameManager,
      settingsConstants.volContainerOpts,
      userVolIdx,
      escapeConstants.radioButtonsXSpace,
      volumeRadioOptTextStyle,
      escapeConstants.volOptXPos,
      escapeConstants.volOptYPos,
      escapeConstants.volOptTextAnchorX,
      escapeConstants.volOptTextAnchorY,
      15,
      3,
      10,
      escapeConstants.volOptTextXOffset,
      escapeConstants.volOptTextYOffset
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
      ImageAssets.mediumButton.key,
      { x: screenSize.x * 0.25, y: escapeConstants.buttonYPos },
      escapeConstants.textOriX,
      escapeConstants.textOriY,
      escapeOptButtonStyle
    );

    const continueButton = createButton(
      gameManager,
      'Continue',
      async () => {
        if (GameActionManager.getInstance().isCurrentPhase(GamePhaseType.EscapeMenu)) {
          await GameActionManager.getInstance().popPhase();
        }
      },
      ImageAssets.mediumButton.key,
      { x: screenSize.x * 0.5, y: escapeConstants.buttonYPos },
      escapeConstants.textOriX,
      escapeConstants.textOriY,
      escapeOptButtonStyle
    );

    const applySettingsButton = createButton(
      gameManager,
      'Apply Settings',
      () => this.applySettings(),
      ImageAssets.mediumButton.key,
      { x: screenSize.x * 0.75, y: escapeConstants.buttonYPos },
      escapeConstants.textOriX,
      escapeConstants.textOriY,
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

  public deactivateUI() {
    GameActionManager.getInstance()
      .getGameManager()
      .layerManager.clearSeveralLayers([Layer.Escape]);
  }

  private async applySettings() {
    if (this.volumeOptions) {
      // Save settings
      const volumeVal = parseFloat(this.volumeOptions.getChosenChoice());
      await GameActionManager.getInstance()
        .getGameManager()
        .saveManager.saveSettings({ volume: volumeVal });

      // Apply settings
      const newUserSetting = GameActionManager.getInstance()
        .getGameManager()
        .saveManager.getLoadedUserState();
      GameActionManager.getInstance()
        .getGameManager()
        .soundManager.applyUserSettings(newUserSetting);
    }
  }
}

export default GameEscapeManager;
