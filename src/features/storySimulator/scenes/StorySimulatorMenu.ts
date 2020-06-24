import { screenCenter, screenSize } from 'src/features/game/commons/CommonConstants';
import commonAssets, { studentRoomImg } from 'src/features/storySimulator/utils/Assets';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import GameLayerManager from 'src/features/game/layer/GameLayerManager';
import { ImageAsset } from 'src/features/game/commons/CommonsTypes';
import { vBannerButton } from './StorySimulatorMenuHelper';

class StorySimulatorMenu extends Phaser.Scene {
  private layerManager: GameLayerManager;

  constructor() {
    super('StorySimulatorMenu');
    this.layerManager = new GameLayerManager();
  }
  public init() {
    this.layerManager.initialiseMainLayer(this);
  }

  public async preload() {
    commonAssets.forEach((asset: ImageAsset) => this.load.image(asset.key, asset.path));
  }

  public async create() {
    this.renderBackground();
    this.renderOptionButtons();
  }

  private renderOptionButtons() {
    const optionsContainer = new Phaser.GameObjects.Container(this, 0, 0);
    const buttons = [
      {
        text: 'Object Placement',
        callback: () => this.scene.start('ObjectPlacement')
      },
      {
        text: 'Simulate Checkpoint',
        callback: () => this.scene.start('StorySimulatorTransition')
      }
    ];
    optionsContainer.add(
      buttons.map((button, buttonIndex) => vBannerButton(this, button, buttonIndex, buttons.length))
    );
    this.layerManager.addToLayer(Layer.UI, optionsContainer);
  }

  public renderBackground() {
    const backgroundImg = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      studentRoomImg.key
    );
    backgroundImg.setDisplaySize(screenSize.x, screenSize.y);
    this.add.existing(backgroundImg);

    this.layerManager.addToLayer(Layer.Background, backgroundImg);
  }
}

export default StorySimulatorMenu;
