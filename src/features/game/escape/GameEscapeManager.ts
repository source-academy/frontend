import { screenSize, screenCenter } from '../commons/CommonConstants';
import { createButton } from '../utils/ButtonUtils';
import escapeConstants, {
  escapeOptButtonStyle,
  volumeRadioOptTextStyle,
  optTextStyle
} from './GameEscapeConstants';
import { Layer } from '../layer/GameLayerTypes';
import settingsConstants from '../scenes/settings/SettingsConstants';
import { GamePhaseType } from '../phase/GamePhaseTypes';
import { IGameUI } from '../commons/CommonTypes';
import { createBitmapText } from '../utils/TextUtils';
import ImageAssets from '../assets/ImageAssets';
import { calcTableFormatPos } from '../utils/StyleUtils';
import CommonRadioButton from '../commons/CommonRadioButton';
import GameSaveManager from '../save/GameSaveManager';
import GameLayerManager from '../layer/GameLayerManager';
import GameSoundManager from '../sound/GameSoundManager';
import GamePhaseManager from '../phase/GamePhaseManager';
import GameInputManager from '../input/GameInputManager';

class GameEscapeManager implements IGameUI {
  private volumeOptions: CommonRadioButton | undefined;
  private scene: Phaser.Scene | undefined;
  private layerManager: GameLayerManager | undefined;
  private phaseManager: GamePhaseManager | undefined;
  private soundManager: GameSoundManager | undefined;
  private inputManager: GameInputManager | undefined;
  private saveManager: GameSaveManager | undefined;
  private isStorySimulator: boolean;

  constructor() {
    this.isStorySimulator = false;
  }

  public initialise(
    scene: Phaser.Scene,
    layerManager: GameLayerManager,
    phaseManager: GamePhaseManager,
    soundManager: GameSoundManager,
    inputManager: GameInputManager,
    saveManager: GameSaveManager,
    isStorySimulator: boolean
  ) {
    this.scene = scene;
    this.layerManager = layerManager;
    this.phaseManager = phaseManager;
    this.soundManager = soundManager;
    this.inputManager = inputManager;
    this.saveManager = saveManager;
    this.isStorySimulator = isStorySimulator;
  }

  private createUIContainer() {
    const escapeMenuContainer = new Phaser.GameObjects.Container(this.getScene(), 0, 0);

    const escapeMenuBg = new Phaser.GameObjects.Image(
      this.getScene(),
      screenCenter.x,
      screenCenter.y,
      ImageAssets.escapeMenuBackground.key
    )
      .setDisplaySize(screenSize.x, screenSize.y)
      .setInteractive({ pixelPerfect: true });

    const volOpt = this.createVolOptContainer();
    escapeMenuContainer.add([escapeMenuBg, volOpt]);

    const buttons = this.getOptButtons();
    const buttonPositions = calcTableFormatPos({
      numOfItems: buttons.length
    });

    escapeMenuContainer.add(
      buttons.map((button, index) =>
        this.createEscapeOptButton(
          button.text,
          buttonPositions[index][0],
          buttonPositions[index][1] + escapeConstants.buttonYPos,
          button.callback
        )
      )
    );

    return escapeMenuContainer;
  }

  public getOptButtons() {
    return [
      {
        text: 'Main Menu',
        callback: () => {
          this.cleanUp();
          if (this.isStorySimulator) {
            this.getScene().scene.start('StorySimulatorMenu');
          } else {
            this.getScene().scene.start('MainMenu');
          }
        }
      },
      {
        text: 'Continue',
        callback: async () => {
          if (this.getPhaseManager().isCurrentPhase(GamePhaseType.EscapeMenu)) {
            await this.getPhaseManager().popPhase();
          }
        }
      },
      {
        text: 'Apply Settings',
        callback: () => this.applySettings()
      }
    ];
  }

  public activateUI() {
    const escapeMenuContainer = this.createUIContainer();
    this.getLayerManager().addToLayer(Layer.Escape, escapeMenuContainer);
  }

  public deactivateUI() {
    this.getLayerManager().clearSeveralLayers([Layer.Escape]);
  }

  private createVolOptContainer() {
    const volOptContainer = new Phaser.GameObjects.Container(this.getScene(), 0, 0);

    const userVol = this.getSaveManager().getLoadedUserState().settings.volume;
    const userVolIdx = settingsConstants.volContainerOpts.findIndex(
      value => parseFloat(value) === userVol
    );

    const volumeText = createBitmapText(
      this.getScene(),
      'Volume',
      escapeConstants.optTextXPos,
      escapeConstants.optTextYPos,
      optTextStyle
    );

    this.volumeOptions = new CommonRadioButton(
      this.getScene(),
      {
        choices: settingsConstants.volContainerOpts,
        defaultChoiceIdx: userVolIdx,
        maxXSpace: escapeConstants.radioButtonsXSpace,
        radioChoiceConfig: {
          circleDim: 15,
          checkedDim: 10,
          outlineThickness: 3
        },
        choiceTextConfig: { x: 0, y: -45, oriX: 0.5, oriY: 0.25 },
        bitmapTextStyle: volumeRadioOptTextStyle
      },
      escapeConstants.volOptXPos,
      escapeConstants.volOptYPos
    );

    volOptContainer.add([volumeText, this.volumeOptions]);
    return volOptContainer;
  }

  private createEscapeOptButton(text: string, xPos: number, yPos: number, callback: any) {
    return createButton(
      this.getScene(),
      {
        assetKey: ImageAssets.mediumButton.key,
        message: text,
        textConfig: { x: 0, y: 0, oriX: 0.37, oriY: 0.75 },
        bitMapTextStyle: escapeOptButtonStyle,
        onUp: callback
      },
      this.soundManager
    ).setPosition(xPos, yPos);
  }

  private async applySettings() {
    if (this.volumeOptions) {
      // Save settings
      const volumeVal = parseFloat(this.volumeOptions.getChosenChoice());
      await this.getSaveManager().saveSettings({ volume: volumeVal });

      // Apply settings
      const newUserSetting = this.getSaveManager().getLoadedUserState();
      this.getSoundManager().applyUserSettings(newUserSetting);
    }
  }

  private getScene() {
    if (!this.scene) {
      throw new Error('Scene does not exist');
    }
    return this.scene;
  }

  private getLayerManager() {
    if (!this.layerManager) {
      throw new Error('Layer Manager does not exist');
    }
    return this.layerManager;
  }

  private getSoundManager() {
    if (!this.soundManager) {
      throw new Error('Sound Manager does not exist');
    }
    return this.soundManager;
  }

  private getSaveManager() {
    if (!this.saveManager) {
      throw new Error('Save Manager does not exist');
    }
    return this.saveManager;
  }

  private getPhaseManager() {
    if (!this.phaseManager) {
      throw new Error('Phase Manager does not exist');
    }
    return this.phaseManager;
  }

  private getInputManager() {
    if (!this.inputManager) {
      throw new Error('Input Manager does not exist');
    }
    return this.inputManager;
  }

  private cleanUp() {
    this.getSoundManager().stopCurrBgMusic();
    this.getInputManager().clearListeners();
    this.getLayerManager().clearAllLayers();
  }
}

export default GameEscapeManager;
