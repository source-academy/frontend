import ImageAssets from '../../assets/ImageAssets';
import CommonBackButton from '../../commons/CommonBackButton';
import { screenCenter, screenSize } from '../../commons/CommonConstants';
import CommonRadioButton from '../../commons/CommonRadioButton';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import SourceAcademyGame from '../../SourceAcademyGame';
import { createButton } from '../../utils/ButtonUtils';
import { calcTableFormatPos, Direction } from '../../utils/StyleUtils';
import { createBitmapText } from '../../utils/TextUtils';
import settingsConstants, {
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
  private layerManager: GameLayerManager;

  constructor() {
    super('Settings');
    this.layerManager = new GameLayerManager();
  }
  public preload() {
    SourceAcademyGame.getInstance().setCurrentSceneRef(this);
    this.layerManager.initialise(this);
  }

  public async create() {
    this.renderBackground();
    this.renderOptions();
  }

  private renderBackground() {
    const background = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      ImageAssets.settingBackground.key
    );

    const settingBgImg = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      ImageAssets.settingBanner.key
    );
    this.layerManager.addToLayer(Layer.Background, background);
    this.layerManager.addToLayer(Layer.Background, settingBgImg);
  }

  private renderOptions() {
    // Create Headers
    const optCont = new Phaser.GameObjects.Container(this, 0, 0);
    const optHeader = this.getSettingsHeader();
    const optHeaderPos = calcTableFormatPos({
      direction: Direction.Column,
      numOfItems: optHeader.length,
      maxYSpace: settingsConstants.optYSpace
    });
    optCont.add(
      optHeader.map((header, index) => this.createOptionHeader(header, optHeaderPos[index][1]))
    );

    // Get user default choice
    const { bgmVolume, sfxVolume } = this.getSaveManager().getSettings();
    const sfxVolIdx = settingsConstants.volContainerOpts.findIndex(
      value => parseFloat(value) === sfxVolume
    );
    const bgmVolIdx = settingsConstants.volContainerOpts.findIndex(
      value => parseFloat(value) === bgmVolume
    );

    // Create SFX Radio Buttons
    this.sfxVolumeRadioButtons = this.createOptRadioOptions(sfxVolIdx, optHeaderPos[0][1]);
    // Create BGM Radio Buttons
    this.bgmVolumeRadioButtons = this.createOptRadioOptions(bgmVolIdx, optHeaderPos[1][1]);

    const applySettingsButton = createButton(this, {
      assetKey: ImageAssets.mediumButton.key,
      message: 'Apply Settings',
      textConfig: { x: 0, y: 0, oriX: 0.33, oriY: 0.85 },
      bitMapTextStyle: applySettingsTextStyle,
      onUp: () => this.applySettings()
    }).setPosition(screenCenter.x, screenSize.y * 0.925);

    const backButton = new CommonBackButton(this, () => {
      this.layerManager.clearAllLayers();
      this.scene.start('MainMenu');
    });

    this.layerManager.addToLayer(Layer.UI, optCont);
    this.layerManager.addToLayer(Layer.UI, this.sfxVolumeRadioButtons);
    this.layerManager.addToLayer(Layer.UI, this.bgmVolumeRadioButtons);
    this.layerManager.addToLayer(Layer.UI, applySettingsButton);
    this.layerManager.addToLayer(Layer.UI, backButton);
  }

  private getSettingsHeader() {
    return ['SFX', 'BGM'];
  }

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
      settingsConstants.optTextXPos,
      0,
      optionHeaderTextStyle
    ).setOrigin(0.5, 0.75);
    optHeaderCont.add([headerDiv, headerText]);
    return optHeaderCont;
  }

  private createOptRadioOptions(defaultChoiceIdx: number, yPos: number) {
    return new CommonRadioButton(
      this,
      {
        choices: settingsConstants.volContainerOpts,
        defaultChoiceIdx: defaultChoiceIdx,
        maxXSpace: settingsConstants.optXSpace,
        choiceTextConfig: { x: 0, y: -50, oriX: 0.5, oriY: 0.25 },
        bitmapTextStyle: optionTextStyle
      },
      settingsConstants.optXPos,
      -screenCenter.y + yPos
    );
  }

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
}

export default Settings;
