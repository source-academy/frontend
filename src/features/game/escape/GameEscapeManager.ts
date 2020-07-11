import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { screenSize, screenCenter } from '../commons/CommonConstants';
import { createButton } from '../utils/ButtonUtils';
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
import GameManager from '../scenes/gameManager/GameManager';

class GameEscapeManager implements IGameUI {
  private volumeOptions: CommonRadioButtons | undefined;

  constructor() {
    this.volumeOptions = undefined;
  }

  public activateUI() {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();

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

    const userVol = GameGlobalAPI.getInstance().getGameManager().saveManager.getLoadedUserState()
      .settings.volume;
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

    const mainMenuButton = this.createEscapeOptButton(gameManager, 'Main Menu', () => {
      gameManager.cleanUp();
      if (gameManager.isStorySimulator) {
        gameManager.scene.start('StorySimulatorMenu');
      } else {
        gameManager.scene.start('MainMenu');
      }
    }).setPosition(screenSize.x * 0.25, escapeConstants.buttonYPos);

    const continueButton = this.createEscapeOptButton(gameManager, 'Continue', async () => {
      if (GameGlobalAPI.getInstance().isCurrentPhase(GamePhaseType.EscapeMenu)) {
        await GameGlobalAPI.getInstance().popPhase();
      }
    }).setPosition(screenSize.x * 0.5, escapeConstants.buttonYPos);

    const applySettingsButton = this.createEscapeOptButton(gameManager, 'Apply Settings', () =>
      this.applySettings()
    ).setPosition(screenSize.x * 0.75, escapeConstants.buttonYPos);

    escapeMenuContainer.add([
      escapeMenuBg,
      volumeText,
      this.volumeOptions,
      mainMenuButton,
      continueButton,
      applySettingsButton
    ]);
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.Escape, escapeMenuContainer);
  }

  public deactivateUI() {
    GameGlobalAPI.getInstance().getGameManager().layerManager.clearSeveralLayers([Layer.Escape]);
  }

  private createEscapeOptButton(gameManager: GameManager, text: string, callback: any) {
    return createButton(
      gameManager,
      {
        assetKey: ImageAssets.mediumButton.key,
        message: text,
        textConfig: { x: 0, y: 0, oriX: 0.25, oriY: 0.7 },
        bitMapTextStyle: escapeOptButtonStyle,
        onUp: callback
      },
      gameManager.soundManager
    );
  }

  private async applySettings() {
    if (this.volumeOptions) {
      // Save settings
      const volumeVal = parseFloat(this.volumeOptions.getChosenChoice());
      await GameGlobalAPI.getInstance().saveSettings({ volume: volumeVal });

      // Apply settings
      const newUserSetting = GameGlobalAPI.getInstance().getLoadedUserState();
      GameGlobalAPI.getInstance().applySoundSettings(newUserSetting);
    }
  }
}

export default GameEscapeManager;
