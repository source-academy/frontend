import ImageAssets from '../../assets/ImageAssets';
import CommonBackButton from '../../commons/CommonBackButton';
import { screenCenter, screenSize } from '../../commons/CommonConstants';
import CommonRadioButton from '../../commons/CommonRadioButton';
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
  private bgmVolumeRadioButtons: CommonRadioButton | undefined;
  private sfxVolumeRadioButtons: CommonRadioButton | undefined;
  private layerManager?: GameLayerManager;

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

    // Get user default choice
    const { bgmVolume, sfxVolume } = this.getSaveManager().getSettings();
    const sfxVolIdx = SettingsConstants.volContainerOpts.findIndex(
      value => parseFloat(value) === sfxVolume
    );
    const bgmVolIdx = SettingsConstants.volContainerOpts.findIndex(
      value => parseFloat(value) === bgmVolume
    );

    // Create SFX Radio Buttons
    this.sfxVolumeRadioButtons = this.createOptRadioOptions(sfxVolIdx, optHeaderPos[0][1]);
    // Create BGM Radio Buttons
    this.bgmVolumeRadioButtons = this.createOptRadioOptions(bgmVolIdx, optHeaderPos[1][1]);

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
    this.getLayerManager().addToLayer(Layer.UI, this.sfxVolumeRadioButtons);
    this.getLayerManager().addToLayer(Layer.UI, this.bgmVolumeRadioButtons);
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
   * Create a radio buttons, formatted with settings' style.
   *
   * @param defaultChoiceIdx default choice of the radio button
   * @param yPos y position of the radio button
   */
  private createOptRadioOptions(defaultChoiceIdx: number, yPos: number) {
    return new CommonRadioButton(
      this,
      {
        choices: SettingsConstants.volContainerOpts,
        defaultChoiceIdx: defaultChoiceIdx,
        maxXSpace: SettingsConstants.opt.xSpace,
        choiceTextConfig: SettingsConstants.radioButtonsTextConfig,
        bitmapTextStyle: optionTextStyle
      },
      SettingsConstants.opt.x,
      -screenCenter.y + yPos
    );
  }

  /**
   * Fetch the current radio buttons value, save it, then apply it.
   *
   * This method is responsible in contacting the managers that
   * need to be aware of the update.
   */
  public async applySettings() {
    const sfxVol = this.sfxVolumeRadioButtons
      ? parseFloat(this.sfxVolumeRadioButtons.getChosenChoice())
      : 1;
    const bgmVol = this.bgmVolumeRadioButtons
      ? parseFloat(this.bgmVolumeRadioButtons.getChosenChoice())
      : 1;

    // Save settings
    await this.getSaveManager().saveSettings({ bgmVolume: bgmVol, sfxVolume: sfxVol });

    // Apply settings
    SourceAcademyGame.getInstance()
      .getSoundManager()
      .applyUserSettings(this.getSaveManager().getSettings());
  }

  public getSaveManager = () => SourceAcademyGame.getInstance().getSaveManager();
  public getLayerManager = () => mandatory(this.layerManager);
}

export default Settings;
