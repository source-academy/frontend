import RadioButtons from '../../commons/CommonRadioButtons';
import GameLayerManager from '../../layer/GameLayerManager';
import { screenCenter, screenSize } from '../../commons/CommonConstants';
import { Layer } from '../../layer/GameLayerTypes';
import {
  volumeContainerOptions,
  optionTextStyle,
  volumeOptionTextAnchorX,
  volumeOptionTextAnchorY,
  optionHeaderTextStyle,
  applySettingsTextStyle,
  applySettingsAnchorX,
  applySettingsAnchorY,
  volumeUnderlineYPos,
  volumeTextXpos,
  volumeTextYPos,
  optionsXSpace,
  optionsXPos,
  volumeOptionYPos
} from './SettingsConstants';
import { createButton } from '../../utils/StyleUtils';
import GameSaveManager from '../../save/GameSaveManager';
import GameSoundManager from '../../sound/GameSoundManager';
import CommonBackButton from '../../commons/CommonBackButton';
import { getSourceAcademyGame } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';
import { loadData } from '../../save/GameSaveRequests';
import { createBitmapText } from '../../utils/TextUtils';
import ImageAssets from '../../assets/ImageAssets';

class Settings extends Phaser.Scene {
  private volumeRadioButtons: RadioButtons | undefined;
  private layerManager: GameLayerManager;
  private settingsSaveManager: GameSaveManager;
  private soundManager: GameSoundManager;

  constructor() {
    super('Settings');
    this.layerManager = new GameLayerManager();
    this.volumeRadioButtons = undefined;
    this.settingsSaveManager = new GameSaveManager();
    this.soundManager = new GameSoundManager();
  }

  public preload() {
    this.layerManager.initialiseMainLayer(this);
    this.soundManager.initialise(this, getSourceAcademyGame());
  }

  public async create() {
    this.renderBackground();
    const accountInfo = getSourceAcademyGame().getAccountInfo();
    const fullSaveState = await loadData(accountInfo);
    this.settingsSaveManager.initialiseForSettings(accountInfo, fullSaveState);
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
    this.renderVolumeOptions();
    const applySettingsButton = createButton(
      this,
      'Apply Settings',
      () => this.applySettings(this.volumeRadioButtons),
      ImageAssets.mediumButton.key,
      { x: screenCenter.x, y: screenSize.y * 0.925 },
      applySettingsAnchorX,
      applySettingsAnchorY,
      applySettingsTextStyle
    );
    const backButton = new CommonBackButton(
      this,
      () => {
        this.layerManager.clearAllLayers();
        this.scene.start('MainMenu');
      },
      0,
      0
    );
    this.layerManager.addToLayer(Layer.UI, applySettingsButton);
    this.layerManager.addToLayer(Layer.UI, backButton);
  }

  private renderVolumeOptions() {
    const volumeBg = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      volumeUnderlineYPos,
      ImageAssets.settingOption.key
    );
    const volumeText = createBitmapText(
      this,
      'Volume',
      volumeTextXpos,
      volumeTextYPos,
      optionHeaderTextStyle
    ).setOrigin(0.5, 0.25);
    const userVol = this.settingsSaveManager.getLoadedUserState().settings.volume;
    const userVolIdx = volumeContainerOptions.findIndex(value => parseFloat(value) === userVol);
    this.volumeRadioButtons = new RadioButtons(
      this,
      volumeContainerOptions,
      userVolIdx,
      optionsXSpace,
      optionTextStyle,
      optionsXPos,
      volumeOptionYPos,
      volumeOptionTextAnchorX,
      volumeOptionTextAnchorY,
      20,
      5,
      15,
      0,
      -70
    );
    this.layerManager.addToLayer(Layer.UI, volumeBg);
    this.layerManager.addToLayer(Layer.UI, volumeText);
    this.layerManager.addToLayer(Layer.UI, this.volumeRadioButtons);
  }

  public async applySettings(volume?: RadioButtons) {
    if (volume) {
      // Save settings
      const volumeVal = parseFloat(volume.getChosenChoice());
      await this.settingsSaveManager.saveSettings({ volume: volumeVal });

      // Apply settings
      const newUserSetting = this.settingsSaveManager.getLoadedUserState();
      this.soundManager.applyUserSettings(newUserSetting);
    }
  }
}

export default Settings;
