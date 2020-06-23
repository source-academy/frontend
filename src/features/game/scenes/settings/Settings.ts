import RadioButtons from '../../commons/CommonRadioButtons';
import GameLayerManager from '../../layer/GameLayerManager';
import { studentRoomImg } from '../../location/GameMapConstants';
import { screenCenter, screenSize } from '../../commons/CommonConstants';
import { Layer } from '../../layer/GameLayerTypes';
import { settingsAssets, settingBg, settingOption } from './SettingsAssets';
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
import { topButton, mediumButton } from '../../commons/CommonAssets';
import { backButtonStyle, backText, backTextYPos } from '../../mode/GameModeTypes';
import { createButton } from '../../utils/StyleUtils';
import GameSaveManager from '../../save/GameSaveManager';
import game, { AccountInfo } from 'src/pages/academy/game/subcomponents/phaserGame';
import GameSoundManager from '../../sound/GameSoundManager';

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
    this.preloadAssets();
    this.layerManager.initialiseMainLayer(this);
    this.soundManager.initialise(this);
  }

  public create() {
    this.renderBackground();
    this.renderOptions();
    this.settingsSaveManager.initialise(this.getAccountInfo());
  }

  private preloadAssets() {
    settingsAssets.forEach(asset => this.load.image(asset.key, asset.path));
  }

  private renderBackground() {
    const background = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      studentRoomImg.key
    );

    const settingBgImg = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      settingBg.key
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
      mediumButton.key,
      { x: screenCenter.x, y: screenSize.y * 0.925 },
      applySettingsAnchorX,
      applySettingsAnchorY,
      applySettingsTextStyle
    );
    const backButton = this.createBackButtonContainer();
    this.layerManager.addToLayer(Layer.UI, applySettingsButton);
    this.layerManager.addToLayer(Layer.UI, backButton);
  }

  private renderVolumeOptions() {
    const volumeBg = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      volumeUnderlineYPos,
      settingOption.key
    );
    const volumeText = new Phaser.GameObjects.Text(
      this,
      volumeTextXpos,
      volumeTextYPos,
      'Volume',
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

  private createBackButtonContainer() {
    const backButtonContainer = new Phaser.GameObjects.Container(this, 0, 0);
    const backButtonText = new Phaser.GameObjects.Text(
      this,
      screenCenter.x,
      backTextYPos,
      backText,
      backButtonStyle
    ).setOrigin(0.5, 0.25);

    const backButtonSprite = new Phaser.GameObjects.Sprite(
      this,
      screenCenter.x,
      screenCenter.y,
      topButton.key
    );
    backButtonSprite.setInteractive({ pixelPerfect: true, useHandCursor: true });
    backButtonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      this.layerManager.clearAllLayers();
      this.scene.start('MainMenu');
    });
    backButtonContainer.add([backButtonSprite, backButtonText]);
    return backButtonContainer;
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

  private getAccountInfo(): AccountInfo {
    if (!game.getAccountInfo()) {
      throw new Error('No account info');
    }
    return game.getAccountInfo()!;
  }
}

export default Settings;
