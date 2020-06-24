import { screenCenter, screenSize } from 'src/features/game/commons/CommonConstants';
import storySimulatorAssets, {
  studentRoomImg
} from 'src/features/storySimulator/utils/StorySimulatorAssets';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import GameLayerManager from 'src/features/game/layer/GameLayerManager';
import { ImageAsset } from 'src/features/game/commons/CommonsTypes';
import { vBannerButton } from './StorySimulatorMenuHelper';
import Parser from 'src/features/game/parser/Parser';

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
    storySimulatorAssets.forEach((asset: ImageAsset) => this.load.image(asset.key, asset.path));
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
        callback: () => this.callGameManager()
      }
    ];
    optionsContainer.add(
      buttons.map((button, buttonIndex) => vBannerButton(this, button, buttonIndex, buttons.length))
    );
    this.layerManager.addToLayer(Layer.UI, optionsContainer);
  }

  private callGameManager() {
    const text = sessionStorage.getItem('checkpointTxt');
    if (text) {
      const gameCheckpoint = Parser.parse(text);

      this.scene.start('GameManager', {
        isStorySimulator: true,
        fullSaveState: undefined,
        gameCheckpoint,
        continueGame: false,
        chapterNum: -1,
        checkpointNum: -1
      });
    }
  }

  private renderBackground() {
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
