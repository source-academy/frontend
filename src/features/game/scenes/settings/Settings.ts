import ImageAssets from '../../assets/ImageAssets';
import CommonBackButton from '../../commons/CommonBackButton';
import CommonCheckBox from '../../commons/CommonCheckBox';
import { screenCenter, screenSize } from '../../commons/CommonConstants';
import CommonSlider from '../../commons/CommonSlider';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import SourceAcademyGame from '../../SourceAcademyGame';
import { createButton } from '../../utils/ButtonUtils';
import { mandatory } from '../../utils/GameUtils';
import { calcTableFormatPos, Direction } from '../../utils/StyleUtils';
import { createBitmapText } from '../../utils/TextUtils';
import SettingsConstants, {
  applySettingsTextStyle,
  optionHeaderTextStyle,
  optionTextStyle
} from './SettingsConstants';

/**
 * Settings scene, in which students can control
 * different settings of the game.
 */
class Settings extends Phaser.Scene {
  private layerManager?: GameLayerManager;

  // Volume sliders and mute button
  private bgmVomlumeSlider: CommonSlider | undefined;
  private sfxVolumeSlider: CommonSlider | undefined;
  private muteButton: CommonCheckBox | undefined;

  constructor() {
    super('Settings');
  }

  public async create() {
    SourceAcademyGame.getInstance().setCurrentSceneRef(this);
    this.layerManager = new GameLayerManager(this);
    this.renderBackground();
    this.renderOptions();
  }

  /**
   * Set up the background and add it to the background layer.
   */
  private renderBackground() {
    const background = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      ImageAssets.spaceshipBg.key
    );

    const settingBgImg = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      ImageAssets.settingBanner.key
    );
    this.getLayerManager().addToLayer(Layer.Background, background);
    this.getLayerManager().addToLayer(Layer.Background, settingBgImg);
  }

  /**
   * Add various settings that user can use.
   * Sets up the header and the radio buttons, and add it to the screen.
   */
  private renderOptions() {
    // Create Headers
    const optCont = new Phaser.GameObjects.Container(this, 0, 0);
    const optHeader = this.getSettingsHeader();
    const optHeaderPos = calcTableFormatPos({
      direction: Direction.Column,
      numOfItems: optHeader.length,
      maxYSpace: SettingsConstants.opt.ySpace
    });
    optCont.add(
      optHeader.map((header, index) => this.createOptionHeader(header, optHeaderPos[index][1]))
    );

    // Get user settings, to use as default choice in the radio buttons
    const { bgmVolume, sfxVolume, isMuted } = this.getSaveManager().getSettings();

    this.sfxVolumeSlider = this.createSettingsSlider(sfxVolume, 170);
    this.bgmVomlumeSlider = this.createSettingsSlider(bgmVolume, 360);
    this.muteButton = new CommonCheckBox(
      this,
      isMuted,
      { sideLength: 50, outlineThickness: 3 },
      { x: 0, y: 0, oriX: -0.5, oriY: 0.5 },
      optionTextStyle,
      700,
      225,
      'Mute Audio'
    );
    this.getLayerManager().addToLayer(Layer.UI, this.sfxVolumeSlider);
    this.getLayerManager().addToLayer(Layer.UI, this.bgmVomlumeSlider);
    this.getLayerManager().addToLayer(Layer.UI, this.muteButton);

    // Create apply settings button
    const applySettingsButton = createButton(this, {
      assetKey: ImageAssets.mediumButton.key,
      message: 'Apply Settings',
      textConfig: { x: 0, y: 0, oriX: 0.33, oriY: 0.85 },
      bitMapTextStyle: applySettingsTextStyle,
      onUp: () => this.applySettings()
    }).setPosition(screenCenter.x, screenSize.y * 0.925);

    // Create back button to main menu
    const backButton = new CommonBackButton(this, () => {
      this.getLayerManager().clearAllLayers();
      this.scene.start('MainMenu');
    });

    this.getLayerManager().addToLayer(Layer.UI, optCont);
    this.getLayerManager().addToLayer(Layer.UI, applySettingsButton);
    this.getLayerManager().addToLayer(Layer.UI, backButton);
  }

  /**
   * Options header to display.
   */
  private getSettingsHeader() {
    return ['SFX', 'BGM'];
  }

  /**
   * Formats the header text as well as the blue arrow and
   * underline, and place it based on the given yPos.
   *
   * @param header text for the header
   * @param yPos y position of the option
   */
  private createOptionHeader(header: string, yPos: number) {
    const optHeaderCont = new Phaser.GameObjects.Container(this, 0, yPos);
    const headerDiv = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      0,
      ImageAssets.settingOption.key
    );
    const headerText = createBitmapText(
      this,
      header,
      SettingsConstants.optHeaderTextConfig,
      optionHeaderTextStyle
    );
    optHeaderCont.add([headerDiv, headerText]);
    return optHeaderCont;
  }

  /**
   * Create sliders matching the escape menu style.
   *
   * @param defaultChoiceValue default option for the radio button
   * @param yPos y position of the slider
   */
  private createSettingsSlider(value: number, yPos: number) {
    return new CommonSlider(
      this,
      {
        minMax: [0.0, 2.0],
        defaultChoiceValue: value,
        maxXSpace: SettingsConstants.opt.xSpace,
        sliderButtonConfig: {
          circleDim: 50,
          dragDim: 40,
          outlineThickness: 5
        },
        choiceTextConfig: SettingsConstants.radioButtonsTextConfig,
        bitmapTextStyle: optionTextStyle
      },
      SettingsConstants.opt.x + 185,
      yPos
    );
  }

  /**
   * Fetch the current radio buttons value, save it, then apply it.
   *
   * This method is responsible in contacting the managers that
   * need to be aware of the update.
   */
  private async applySettings() {
    const sfxVol = this.sfxVolumeSlider ? this.sfxVolumeSlider.getValue() : 1;
    const bgmVol = this.bgmVomlumeSlider ? this.bgmVomlumeSlider.getValue() : 1;
    const muted = this.muteButton ? this.muteButton.getChoice() : false;

    // Save settings
    const newSettings = { bgmVolume: bgmVol, sfxVolume: sfxVol, isMuted: muted };
    await this.getSaveManager().saveSettings(newSettings);

    // Apply settings
    SourceAcademyGame.getInstance().getSoundManager().applyUserSettings(newSettings);
  }

  public getSaveManager = () => SourceAcademyGame.getInstance().getSaveManager();
  public getLayerManager = () => mandatory(this.layerManager);
}

export default Settings;
