import { getSourceAcademyGame } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';

import ImageAssets from '../../assets/ImageAssets';
import CommonBackButton from '../../commons/CommonBackButton';
import { screenCenter, screenSize } from '../../commons/CommonConstants';
import CommonRadioButton from '../../commons/CommonRadioButton';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import GameSaveManager from '../../save/GameSaveManager';
import { loadData } from '../../save/GameSaveRequests';
import GameSoundManager from '../../sound/GameSoundManager';
import { createButton } from '../../utils/ButtonUtils';
import { createBitmapText } from '../../utils/TextUtils';
import settingsConstants, {
  applySettingsTextStyle,
  optionHeaderTextStyle,
  optionTextStyle
} from './SettingsConstants';

class Settings extends Phaser.Scene {
  private volumeRadioButtons: CommonRadioButton | undefined;
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
    this.layerManager.initialise(this);
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
      {
        assetKey: ImageAssets.mediumButton.key,
        message: 'Apply Settings',
        textConfig: { x: 0, y: 0, oriX: 0.33, oriY: 0.85 },
        bitMapTextStyle: applySettingsTextStyle,
        onUp: () => this.applySettings(this.volumeRadioButtons)
      },
      this.soundManager
    ).setPosition(screenCenter.x, screenSize.y * 0.925);

    const backButton = new CommonBackButton(
      this,
      () => {
        this.layerManager.clearAllLayers();
        this.scene.start('MainMenu');
      },
      this.soundManager
    );
    this.layerManager.addToLayer(Layer.UI, applySettingsButton);
    this.layerManager.addToLayer(Layer.UI, backButton);
  }

  private renderVolumeOptions() {
    const volumeBg = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      settingsConstants.volUnderlineYPos,
      ImageAssets.settingOption.key
    );
    const volumeText = createBitmapText(
      this,
      'Volume',
      settingsConstants.volTextXpos,
      settingsConstants.volTextYPos,
      optionHeaderTextStyle
    ).setOrigin(0.5, 0.25);
    const userVol = this.settingsSaveManager.getLoadedUserState().settings.volume;
    const userVolIdx = settingsConstants.volContainerOpts.findIndex(
      value => parseFloat(value) === userVol
    );
    this.volumeRadioButtons = new CommonRadioButton(
      this,
      {
        choices: settingsConstants.volContainerOpts,
        defaultChoiceIdx: userVolIdx,
        maxXSpace: settingsConstants.optXSpace,
        choiceTextConfig: { x: 0, y: -50, oriX: 0.5, oriY: 0.25 },
        bitmapTextStyle: optionTextStyle
      },
      settingsConstants.optXPos,
      settingsConstants.volOptYPos,
      this.soundManager
    );
    this.layerManager.addToLayer(Layer.UI, volumeBg);
    this.layerManager.addToLayer(Layer.UI, volumeText);
    this.layerManager.addToLayer(Layer.UI, this.volumeRadioButtons);
  }

  public async applySettings(volume?: CommonRadioButton) {
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
