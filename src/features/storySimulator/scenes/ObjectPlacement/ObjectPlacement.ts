import { screenCenter, screenSize } from 'src/features/game/commons/CommonConstants';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import GameLayerManager from 'src/features/game/layer/GameLayerManager';
import storySimulatorAssets, {
  studentRoomImg
} from 'src/features/storySimulator/utils/StorySimulatorAssets';
import { ImageAsset } from 'src/features/game/commons/CommonsTypes';
import SSObjectManager from '../../objects/SSObjectManager';
import { objectPlacementButton } from './ObjectPlacementHelper';
import CommonBackButton from 'src/features/game/commons/CommonBackButton';

export default class ObjectPlacement extends Phaser.Scene {
  public layerManager: GameLayerManager;
  private objectManager: SSObjectManager;

  constructor() {
    super('ObjectPlacement');
    this.layerManager = new GameLayerManager();
    this.objectManager = new SSObjectManager();
  }

  public async preload() {
    storySimulatorAssets.forEach((asset: ImageAsset) => this.load.image(asset.key, asset.path));
  }

  public create() {
    this.layerManager.initialiseMainLayer(this);
    this.objectManager.initialise(this);
    this.renderBackground();
    this.createUIButtons();
  }

  private createUIButtons() {
    const uiContainer = new Phaser.GameObjects.Container(this, 0, 0);
    const backButton = new CommonBackButton(
      this,
      () => this.scene.start('StorySimulatorMenu'),
      0,
      0
    );
    const buttonDetails = [
      { name: 'Add Object', onClick: () => this.objectManager.loadObject() },
      {
        name: 'Print Objects',
        onClick: () => this.objectManager.printMap(),
        onHover: () => this.objectManager.showMap(),
        onPointerout: () => this.objectManager.hideMap()
      }
    ];

    uiContainer.add(backButton);
    uiContainer.add(
      buttonDetails.map((button, buttonIndex) =>
        objectPlacementButton(this, button, buttonIndex, buttonDetails.length)
      )
    );

    this.layerManager.addToLayer(Layer.UI, uiContainer);
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
