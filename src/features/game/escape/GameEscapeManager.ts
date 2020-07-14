import ImageAssets from '../assets/ImageAssets';
import { screenCenter,screenSize } from '../commons/CommonConstants';
import CommonRadioButton from '../commons/CommonRadioButton';
import { IBaseScene,IGameUI } from '../commons/CommonTypes';
import GameInputManager from '../input/GameInputManager';
import GameLayerManager from '../layer/GameLayerManager';
import { Layer } from '../layer/GameLayerTypes';
import GamePhaseManager from '../phase/GamePhaseManager';
import { GamePhaseType } from '../phase/GamePhaseTypes';
import GameSaveManager from '../save/GameSaveManager';
import settingsConstants from '../scenes/settings/SettingsConstants';
import GameSoundManager from '../sound/GameSoundManager';
import { createButton } from '../utils/ButtonUtils';
import { mandatory } from '../utils/GameUtils';
import { calcTableFormatPos } from '../utils/StyleUtils';
import { createBitmapText } from '../utils/TextUtils';
import escapeConstants, {
  escapeOptButtonStyle,
  optTextStyle,
  volumeRadioOptTextStyle} from './GameEscapeConstants';

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
    scene: IBaseScene,
    phaseManager: GamePhaseManager,
    saveManager: GameSaveManager,
    isStorySimulator: boolean
  ) {
    this.scene = scene;
    this.layerManager = scene.layerManager;
    this.soundManager = scene.soundManager;
    this.inputManager = scene.inputManager;
    this.phaseManager = phaseManager;
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

  private getScene = () => mandatory(this.scene) as Phaser.Scene;
  private getLayerManager = () => mandatory(this.layerManager) as GameLayerManager;
  private getSoundManager = () => mandatory(this.soundManager) as GameSoundManager;
  private getSaveManager = () => mandatory(this.saveManager) as GameSaveManager;
  private getPhaseManager = () => mandatory(this.phaseManager) as GamePhaseManager;
  private getInputManager = () => mandatory(this.inputManager) as GameInputManager;

  private cleanUp() {
    this.getSoundManager().stopCurrBgMusic();
    this.getInputManager().clearListeners();
    this.getLayerManager().clearAllLayers();
  }
}

export default GameEscapeManager;
