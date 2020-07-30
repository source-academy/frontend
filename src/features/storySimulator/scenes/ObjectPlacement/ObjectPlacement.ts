import CommonBackButton from 'src/features/game/commons/CommonBackButton';
import { screenCenter, screenSize } from 'src/features/game/commons/CommonConstants';
import { AssetKey, AssetPath } from 'src/features/game/commons/CommonTypes';
import GameInputManager from 'src/features/game/input/GameInputManager';
import GameLayerManager from 'src/features/game/layer/GameLayerManager';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import SourceAcademyGame from 'src/features/game/SourceAcademyGame';
import { mandatory } from 'src/features/game/utils/GameUtils';

import SSImageAssets from '../../assets/ImageAssets';
import SSBackgroundManager from '../../background/SSBackgroundManager';
import SSBBoxManager from '../../boundingBoxes/SSBBoxManager';
import SSCursorMode from '../../cursorMode/SSCursorMode';
import { CursorMode } from '../../cursorMode/SSCursorModeTypes';
import SSLogManager from '../../logger/SSLogManager';
import SSObjectManager from '../../objects/SSObjectManager';
import { StorySimState } from '../../StorySimulatorTypes';
import SSTransformManager from '../../transform/SSTransformManager';
import ObjPlacementConstants from './ObjectPlacementConstants';

/**
 * Allow users to position objects, set backgrounds, and get
 * the coordinates of the objects.
 */
export default class ObjectPlacement extends Phaser.Scene {
  public layerManager?: GameLayerManager;
  public inputManager?: GameInputManager;
  private transformManager: SSTransformManager;
  private cursorModes: SSCursorMode | undefined;
  private bboxManager: SSBBoxManager;
  private objectManager: SSObjectManager;
  private backgroundManager: SSBackgroundManager;
  private logManager: SSLogManager;

  private assetMap: Map<AssetKey, AssetPath>;
  private itemIdNumber: number;

  private openBracket: Phaser.Input.Keyboard.Key | undefined;
  private closedBracket: Phaser.Input.Keyboard.Key | undefined;

  constructor() {
    super('ObjectPlacement');
    this.objectManager = new SSObjectManager();
    this.bboxManager = new SSBBoxManager();
    this.backgroundManager = new SSBackgroundManager();
    this.logManager = new SSLogManager();
    this.transformManager = new SSTransformManager();

    this.cursorModes = undefined;
    this.itemIdNumber = 0;
    this.assetMap = new Map<AssetKey, AssetPath>();
  }

  public init() {
    this.layerManager = new GameLayerManager(this);
    this.inputManager = new GameInputManager(this);
    this.objectManager = new SSObjectManager();
    this.bboxManager = new SSBBoxManager();
    this.backgroundManager = new SSBackgroundManager();
    this.logManager = new SSLogManager();
    this.transformManager = new SSTransformManager();

    this.cursorModes = undefined;
    this.itemIdNumber = 0;
    this.assetMap = new Map<AssetKey, AssetPath>();
  }

  public create() {
    SourceAcademyGame.getInstance().setCurrentSceneRef(this);

    this.renderBackground();
    this.createUIButtons();
    this.backgroundManager.initialise(this);
    this.objectManager.initialise(this);
    this.bboxManager.initialise(this);
    this.transformManager.initialise(this);
    this.logManager.initialise(this);

    this.openBracket = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.OPEN_BRACKET);
    this.closedBracket = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CLOSED_BRACKET);
  }

  public update() {
    if (this.openBracket && this.openBracket.isDown) {
      this.transformManager.resizeActive(false);
    }
    if (this.closedBracket && this.closedBracket.isDown) {
      this.transformManager.resizeActive(true);
    }

    this.bboxManager.resizeWhileBeingDrawn(this);
  }

  private createUIButtons() {
    const uiContainer = new Phaser.GameObjects.Container(this, 0, 0);
    const backButton = new CommonBackButton(this, () => {
      this.cleanUp();
      SourceAcademyGame.getInstance().setStorySimState(StorySimState.Default);
      this.scene.start('StorySimulatorMenu');
    });

    this.cursorModes = new SSCursorMode(
      this,
      ObjPlacementConstants.cursor.x,
      ObjPlacementConstants.cursor.y
    );
    this.populateCursorModes();

    uiContainer.add(this.cursorModes);
    uiContainer.add(backButton);

    this.getLayerManager().addToLayer(Layer.UI, uiContainer);
  }

  public renderBackground() {
    const backgroundImg = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      SSImageAssets.storySimBg.key
    );
    backgroundImg.setDisplaySize(screenSize.x, screenSize.y);

    this.getLayerManager().addToLayer(Layer.Background, backgroundImg);
  }

  private populateCursorModes() {
    if (this.cursorModes) {
      // Change background
      this.cursorModes.addCursorMode(
        this,
        SSImageAssets.colorIcon.key,
        false,
        'Set background',
        async () => await this.backgroundManager.loadBackground()
      );

      // Add object
      this.cursorModes.addCursorMode(
        this,
        SSImageAssets.imageIcon.key,
        false,
        'Add selected object',
        async () => await this.objectManager.loadObject()
      );

      // Draw BBox
      this.cursorModes.addCursorMode(
        this,
        SSImageAssets.bboxIcon.key,
        true,
        'Draw bounding boxes',
        () => this.cursorModes!.setCursorMode(CursorMode.DrawBBox)
      );

      // Drag/Resize
      this.cursorModes.addCursorMode(this, SSImageAssets.handIcon.key, true, 'Drag or resize', () =>
        this.cursorModes!.setCursorMode(CursorMode.DragResizeObj)
      );

      // Print info
      this.cursorModes.addCursorMode(
        this,
        SSImageAssets.listIcon.key,
        false,
        'Print coordinates',
        () =>
          this.logManager.printCheckpoint(this.backgroundManager.getBackgroundAssetPath(), [
            this.objectManager,
            this.bboxManager
          ]),
        () =>
          this.logManager.showDetailMap([
            ...this.objectManager.getLoggables(),
            ...this.bboxManager.getLoggables()
          ]),
        () => this.logManager.hideDetailMap()
      );

      // Erase Layers
      this.cursorModes.addCursorMode(this, SSImageAssets.eraseIcon.key, false, 'Erase all', () => {
        const confirm = window.confirm('Are you sure you want to delete?');

        if (!confirm) return;
        this.getLayerManager().clearSeveralLayers([Layer.Background, Layer.BBox, Layer.Objects]);
        this.objectManager.deleteAll();
        this.bboxManager.deleteAll();
        this.transformManager.deselect();
        this.renderBackground();
      });

      this.cursorModes.renderCursorModesContainer();
    }
  }

  public getCursorManager = () => mandatory(this.cursorModes);

  public getCoordinates(): number[] {
    return [this.input.x, this.input.y];
  }

  public isCursorMode(cursorMode: CursorMode) {
    return this.getCursorManager().getCurrCursorMode() === cursorMode;
  }

  private cleanUp() {
    this.getInputManager().clearListeners();
    this.getLayerManager().clearAllLayers();
  }

  public addAsset(assetKey: AssetKey, assetPath: AssetPath) {
    this.assetMap.set(assetKey, assetPath);
  }

  public getAssetPath(assetKey: AssetKey) {
    return this.assetMap.get(assetKey);
  }

  public generateItemIdNumber() {
    return this.itemIdNumber++;
  }

  public setActiveSelection(gameObject: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle) {
    this.transformManager.setActiveSelection(gameObject);
  }

  public setObjAttribute(
    objectSprite: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle,
    attribute: string,
    value: number
  ) {
    this.objectManager.setAttribute(objectSprite, attribute, value);
  }

  public deleteObj(objectSprite: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image) {
    this.objectManager.delete(objectSprite);
  }

  public setBBoxAttribute(
    bboxSprite: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle,
    attribute: string,
    value: number
  ) {
    this.bboxManager.setAttribute(bboxSprite, attribute, value);
  }

  public deleteBBox(bboxSprite: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image) {
    this.bboxManager.delete(bboxSprite);
  }

  public getInputManager = () => mandatory(this.inputManager);
  public getLayerManager = () => mandatory(this.layerManager);
}
