import RadioButtons from '../../commons/CommonRadioButtons';
import GameLayerManager from '../../layer/GameLayerManager';
import { studentRoomImg } from '../../location/GameMapConstants';
import { screenCenter } from '../../commons/CommonConstants';
import { Layer } from '../../layer/GameLayerTypes';
import { settingsAssets } from './SettingsAssets';
import {
  volumeContainerOptions,
  volumeOptionXSpace,
  volumeOptionTextStyle,
  volumeContainerXPos,
  volumeContainerYPos,
  volumeOptionTextAnchorX,
  volumeOptionTextAnchorY,
  volumeDefaultOpt,
  optionHeaderTextStyle
} from './SettingsConstants';
import { topButton, mediumBox } from '../../commons/CommonAssets';
import { backButtonStyle, backText, backTextYPos } from '../../mode/GameModeTypes';

class Settings extends Phaser.Scene {
  private volumeRadioButtons: RadioButtons | undefined;
  private layerManager: GameLayerManager;

  constructor() {
    super('Settings');
    this.layerManager = new GameLayerManager();
    this.volumeRadioButtons = undefined;
  }

  public preload() {
    this.preloadAssets();
    this.layerManager.initialiseMainLayer(this);
  }

  public create() {
    this.renderBackground();
    this.renderOptions();
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
    this.layerManager.addToLayer(Layer.Background, background);
  }

  private renderOptions() {
    this.renderVolumeOptions();
    const backButton = this.createBackButtonContainer();
    this.layerManager.addToLayer(Layer.UI, backButton);
  }

  private renderVolumeOptions() {
    const volumeBg = new Phaser.GameObjects.Image(
      this,
      screenCenter.x - 10,
      volumeContainerYPos - 60,
      mediumBox.key
    );
    const volumeText = new Phaser.GameObjects.Text(
      this,
      screenCenter.x,
      volumeContainerYPos - 110,
      'Volume',
      optionHeaderTextStyle
    ).setOrigin(0.5, 0.25);
    this.volumeRadioButtons = new RadioButtons(
      this,
      volumeContainerOptions,
      volumeDefaultOpt,
      volumeOptionXSpace,
      volumeOptionTextStyle,
      volumeContainerXPos,
      volumeContainerYPos,
      volumeOptionTextAnchorX,
      volumeOptionTextAnchorY
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
}

export default Settings;
