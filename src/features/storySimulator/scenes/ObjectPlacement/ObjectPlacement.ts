import { screenCenter, screenSize, Constants } from 'src/features/game/commons/CommonConstants';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import GameLayerManager from 'src/features/game/layer/GameLayerManager';
import storySimulatorAssets, {
  studentRoomImg,
  colorIcon,
  imageIcon,
  bboxIcon,
  handIcon,
  listIcon
} from 'src/features/storySimulator/utils/StorySimulatorAssets';
import { ImageAsset } from 'src/features/game/commons/CommonsTypes';
import SSObjectManager from '../../objects/SSObjectManager';
import CommonBackButton from 'src/features/game/commons/CommonBackButton';
import SSCursorMode from '../../cursorMode/SSCursorMode';
import { cursorModeXPos, cursorModeYPos } from './ObjectPlacementConstants';
import { CursorMode } from '../../cursorMode/SSCursorModeTypes';

export default class ObjectPlacement extends Phaser.Scene {
  public layerManager: GameLayerManager;
  private cursorModes: SSCursorMode | undefined;
  private objectManager: SSObjectManager;
  private keyboardListeners: Phaser.Input.Keyboard.Key[];

  constructor() {
    super('ObjectPlacement');
    this.layerManager = new GameLayerManager();
    this.objectManager = new SSObjectManager();
    this.cursorModes = undefined;
    this.keyboardListeners = [];
  }

  public async preload() {
    storySimulatorAssets.forEach((asset: ImageAsset) => this.load.image(asset.key, asset.path));
  }

  public registerKeyboardListener(keyboardListener: Phaser.Input.Keyboard.Key) {
    this.keyboardListeners.push(keyboardListener);
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
      () => {
        this.cleanUp();
        this.scene.start('StorySimulatorMenu');
      },
      0,
      0
    );

    this.cursorModes = new SSCursorMode(this, cursorModeXPos, cursorModeYPos);
    this.populateCursorModes();

    uiContainer.add(this.cursorModes);
    uiContainer.add(backButton);

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

  private populateCursorModes() {
    if (this.cursorModes) {
      // Change background
      this.cursorModes.addCursorMode(
        this,
        colorIcon.key,
        false,
        'Set background',
        Constants.nullFunction
      );

      // Add object
      this.cursorModes.addCursorMode(this, imageIcon.key, false, 'Add selected object', () =>
        this.objectManager.loadObject()
      );

      // Draw BBox
      this.cursorModes.addCursorMode(this, bboxIcon.key, true, 'Draw bounding boxes', () =>
        this.cursorModes!.setCursorMode(CursorMode.DrawBBox)
      );

      // Drag/Resize
      this.cursorModes.addCursorMode(this, handIcon.key, true, 'Drag or resize', () =>
        this.cursorModes!.setCursorMode(CursorMode.DragResizeObj)
      );

      // Print info
      this.cursorModes.addCursorMode(
        this,
        listIcon.key,
        false,
        'Print coordinates',
        () => this.objectManager.printObjectDetailMap(),
        () => this.objectManager.showObjectDetailMap(),
        () => this.objectManager.hideMap()
      );

      this.cursorModes.renderCursorModesContainer();
    }
  }

  private cleanUp() {
    this.keyboardListeners.forEach(keyboardListener => keyboardListener.removeAllListeners());
    this.layerManager.clearAllLayers();
  }
}
