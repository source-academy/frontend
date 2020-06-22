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
  volumeOptionTextAnchorY
} from './SettingsConstants';
import { topButton } from '../../commons/CommonAssets';
import { backButtonStyle, backText, backTextYPos } from '../../mode/GameModeTypes';

class Settings extends Phaser.Scene {
  private layerManager: GameLayerManager;

  constructor() {
    super('Settings');
    this.layerManager = new GameLayerManager();
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
    const volumeOptions = new RadioButtons(
      this,
      volumeContainerOptions,
      volumeOptionXSpace,
      volumeOptionTextStyle,
      volumeContainerXPos,
      volumeContainerYPos,
      volumeOptionTextAnchorX,
      volumeOptionTextAnchorY
    );
    const backButton = this.createBackButtonContainer();
    this.layerManager.addToLayer(Layer.UI, volumeOptions);
    this.layerManager.addToLayer(Layer.UI, backButton);
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
