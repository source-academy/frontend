import ImageAssets from '../assets/ImageAssets';
import SoundAssets from '../assets/SoundAssets';
import { screenCenter, screenSize } from '../commons/CommonConstants';
import CommonRadioButton from '../commons/CommonRadioButton';
import { IBaseScene, IGameUI } from '../commons/CommonTypes';
import { Layer } from '../layer/GameLayerTypes';
import { GamePhaseType } from '../phase/GamePhaseTypes';
import settingsConstants from '../scenes/settings/SettingsConstants';
import SourceAcademyGame, { GameType } from '../SourceAcademyGame';
import { createButton } from '../utils/ButtonUtils';
import { mandatory } from '../utils/GameUtils';
import { calcTableFormatPos, Direction } from '../utils/StyleUtils';
import { createBitmapText } from '../utils/TextUtils';
import escapeConstants, {
  escapeOptButtonStyle,
  optTextStyle,
  volumeRadioOptTextStyle
} from './GameEscapeConstants';

/**
 * Manager in charge of rendering and destroying the escape manager in a scene
 */
class GameEscapeManager implements IGameUI {
  private bgmVolumeRadioButtons: CommonRadioButton | undefined;
  private sfxVolumeRadioButtons: CommonRadioButton | undefined;
  private scene?: IBaseScene;

  /**
   * Initialises the escape manager UI
   *
   * @param scene - the scene to add escape manager
   */
  public initialise(scene: IBaseScene) {
    this.scene = scene;
    this.scene.phaseManager.addPhaseToMap(GamePhaseType.EscapeMenu, this);
  }

  /**
   * Create the container that encapsulate the 'Escape Menu' UI,
   * i.e. the background, the buttons, and the options.
   */
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
    escapeMenuContainer.add(escapeMenuBg);

    // Settings header
    const settings = this.getSettings();
    const settingsPos = calcTableFormatPos({
      direction: Direction.Column,
      numOfItems: settings.length,
      maxYSpace: escapeConstants.settingsYSpace
    });
    escapeMenuContainer.add(
      settings.map((setting, index) =>
        createBitmapText(
          this.getScene(),
          setting,
          {
            ...escapeConstants.settingsTextConfig,
            y: settingsPos[index][1] + escapeConstants.settingsTextConfig.y
          },
          optTextStyle
        )
      )
    );

    // Get user settings, to use as default choice in the radio buttons
    const { bgmVolume, sfxVolume } = this.getSettingsSaveManager().getSettings();
    const sfxVolIdx = settingsConstants.volContainerOpts.findIndex(
      value => parseFloat(value) === sfxVolume
    );
    const bgmVolIdx = settingsConstants.volContainerOpts.findIndex(
      value => parseFloat(value) === bgmVolume
    );

    // SFX Radio buttons
    this.sfxVolumeRadioButtons = this.createSettingsRadioOptions(sfxVolIdx, settingsPos[0][1]);
    // BGM Radio buttons
    this.bgmVolumeRadioButtons = this.createSettingsRadioOptions(bgmVolIdx, settingsPos[1][1]);
    escapeMenuContainer.add([this.sfxVolumeRadioButtons, this.bgmVolumeRadioButtons]);

    // Get all the buttons
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

  /**
   * Returns all the option available in the escape menu.
   *
   * For SFX and BGM, these are pure headers as the options, interactivity, and functionality
   * are handled separately (radio buttons)
   */
  private getSettings() {
    return ['SFX', 'BGM'];
  }

  /**
   * Create radio buttons matching the escape menu style.
   *
   * @param defaultChoiceIdx default option for the radio button
   * @param yPos y position of the radio buttons
   */
  private createSettingsRadioOptions(defaultChoiceIdx: number, yPos: number) {
    return new CommonRadioButton(
      this.getScene(),
      {
        choices: settingsConstants.volContainerOpts,
        defaultChoiceIdx: defaultChoiceIdx,
        maxXSpace: escapeConstants.radioButtonsXSpace,
        radioChoiceConfig: {
          circleDim: 15,
          checkedDim: 10,
          outlineThickness: 3
        },
        choiceTextConfig: escapeConstants.radioChoiceTextConfig,
        bitmapTextStyle: volumeRadioOptTextStyle
      },
      escapeConstants.volOptXPos,
      -screenCenter.y + yPos + escapeConstants.settingsYOffset
    );
  }

  /**
   * Get the escape options buttons preset to be formatted later.
   * The preset includes the text to be displayed on the button and
   * its functionality.
   */
  private getOptButtons() {
    return [
      {
        text: 'Main Menu',
        callback: () => {
          this.cleanUp();
          if (SourceAcademyGame.getInstance().isGameType(GameType.Simulator)) {
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

  /**
   * Format the button information to a UI container, complete with
   * styling and functionality.
   *
   * @param text text to be displayed on the button
   * @param xPos x position of the button
   * @param yPos y position of the button
   * @param callback callback to be executed on click
   */
  private createEscapeOptButton(text: string, xPos: number, yPos: number, callback: any) {
    return createButton(this.getScene(), {
      assetKey: ImageAssets.mediumButton.key,
      message: text,
      textConfig: escapeConstants.escapeOptTextConfig,
      bitMapTextStyle: escapeOptButtonStyle,
      onUp: callback
    }).setPosition(xPos, yPos);
  }

  /**
   * Process the current settings on escape menu, save, and apply the settings.
   * Escape Menu is responsible in contacting various managers to apply the settings.
   */
  private async applySettings() {
    const sfxVol = this.sfxVolumeRadioButtons
      ? parseFloat(this.sfxVolumeRadioButtons.getChosenChoice())
      : 1;
    const bgmVol = this.bgmVolumeRadioButtons
      ? parseFloat(this.bgmVolumeRadioButtons.getChosenChoice())
      : 1;

    // Save settings
    const newSettings = { bgmVolume: bgmVol, sfxVolume: sfxVol };
    await this.getSettingsSaveManager().saveSettings(newSettings);

    // Apply settings
    SourceAcademyGame.getInstance().getSoundManager().applyUserSettings(newSettings);
  }

  /**
   * Cleaning up of related managers.
   */
  private cleanUp() {
    this.getInputManager().clearListeners();
    this.getLayerManager().clearAllLayers();
  }

  /**
   * Activate the 'Escape Menu' UI.
   *
   * Usually only called by the phase manager when 'Escape' phase is
   * pushed.
   */
  public activateUI() {
    const escapeMenuContainer = this.createUIContainer();
    this.getSoundManager().playSound(SoundAssets.menuEnter.key);
    this.getLayerManager().addToLayer(Layer.Escape, escapeMenuContainer);
  }

  /**
   * Deactivate the 'Escape Menu' UI.
   *
   * Usually only called by the phase manager when 'Escape' phase is
   * transitioned out.
   */
  public deactivateUI() {
    this.getSoundManager().playSound(SoundAssets.menuExit.key);
    this.getLayerManager().clearSeveralLayers([Layer.Escape]);
  }

  private getScene = () => mandatory(this.scene);
  private getLayerManager = () => mandatory(this.getScene().layerManager);
  private getSoundManager = () => SourceAcademyGame.getInstance().getSoundManager();
  private getSettingsSaveManager = () => SourceAcademyGame.getInstance().getSaveManager();
  private getPhaseManager = () => mandatory(this.getScene().phaseManager);
  private getInputManager = () => mandatory(this.getScene().inputManager);
}

export default GameEscapeManager;
