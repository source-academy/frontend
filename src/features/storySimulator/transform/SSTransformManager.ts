import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { mandatory } from 'src/features/game/utils/GameUtils';
import { multiplyDimensions } from 'src/features/game/utils/SpriteUtils';

import { CursorMode } from '../cursorMode/SSCursorModeTypes';
import ObjectPlacement from '../scenes/ObjectPlacement/ObjectPlacement';
import transformConstants from './SSTransformManagerConstants';

export default class SSTransformManager {
  private activeSelection: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle | undefined;
  private activeSelectRect: Phaser.GameObjects.Rectangle | undefined;
  private objectPlacement: ObjectPlacement | undefined;

  public initialise(objectPlacement: ObjectPlacement) {
    this.objectPlacement = objectPlacement;
    this.trackDraggables(objectPlacement);
    this.drawActiveSelectRect();
    this.bindDeleteKey();
  }

  private drawActiveSelectRect() {
    this.activeSelectRect = new Phaser.GameObjects.Rectangle(
      this.getObjectPlacement(),
      0,
      0,
      1,
      1,
      0
    ).setAlpha(0.3);
    this.getObjectPlacement().getLayerManager().addToLayer(Layer.Selector, this.activeSelectRect);
  }

  private trackDraggables(objectPlacement: ObjectPlacement) {
    objectPlacement
      .getInputManager()
      .registerEventListener(
        'drag',
        (
          pointer: MouseEvent,
          gameObject: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle,
          dragX: number,
          dragY: number
        ) => {
          if (!objectPlacement.isCursorMode(CursorMode.DrawBBox)) {
            objectPlacement.getCursorManager().setCursorMode(CursorMode.DragResizeObj);
            gameObject.x = dragX;
            gameObject.y = dragY;
          }

          if (gameObject.data.get('type') === 'object') {
            objectPlacement.setObjAttribute(gameObject, 'x', dragX);
            objectPlacement.setObjAttribute(gameObject, 'y', dragY);
            this.setActiveSelection(gameObject);
          }

          if (gameObject.data.get('type') === 'bbox') {
            objectPlacement.setBBoxAttribute(gameObject, 'x', dragX);
            objectPlacement.setBBoxAttribute(gameObject, 'y', dragY);
            this.setActiveSelection(gameObject);
          }
        }
      );
  }

  public resizeActive(enlarge: boolean) {
    const objectPlacement = this.getObjectPlacement();
    if (!this.activeSelection || !this.activeSelectRect) {
      return;
    }
    const factor = enlarge ? transformConstants.scaleFactor : 1 / transformConstants.scaleFactor;
    multiplyDimensions(this.activeSelection, factor);
    this.activeSelectRect.displayHeight =
      this.activeSelection.displayHeight + transformConstants.activeSelectMargin;
    this.activeSelectRect.displayWidth =
      this.activeSelection.displayWidth + transformConstants.activeSelectMargin;

    if (this.activeSelection.data.get('type') === 'object') {
      objectPlacement.setObjAttribute(
        this.activeSelection,
        'width',
        Math.abs(this.activeSelection.displayWidth)
      );
      objectPlacement.setObjAttribute(
        this.activeSelection,
        'height',
        Math.abs(this.activeSelection.displayHeight)
      );
    }

    if (this.activeSelection.data.get('type') === 'bbox') {
      objectPlacement.setBBoxAttribute(
        this.activeSelection,
        'width',
        Math.abs(this.activeSelection.displayWidth)
      );
      objectPlacement.setBBoxAttribute(
        this.activeSelection,
        'height',
        Math.abs(this.activeSelection.displayHeight)
      );
    }
  }

  public setActiveSelection(gameObject: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle) {
    if (!this.activeSelectRect) {
      return;
    }
    this.activeSelectRect!.setAlpha(0.3);
    this.activeSelection = gameObject;
    this.activeSelectRect.x = gameObject.x;
    this.activeSelectRect.y = gameObject.y;

    this.activeSelectRect.displayHeight =
      gameObject.displayHeight + transformConstants.activeSelectMargin;
    this.activeSelectRect.displayWidth =
      gameObject.displayWidth + transformConstants.activeSelectMargin;
  }

  public deselect() {
    this.activeSelectRect!.setAlpha(0);
    this.activeSelection = undefined;
  }

  private getObjectPlacement = () => mandatory(this.objectPlacement);

  private bindDeleteKey() {
    const deleteKeys = [
      Phaser.Input.Keyboard.KeyCodes.BACKSPACE,
      Phaser.Input.Keyboard.KeyCodes.DELETE
    ];
    deleteKeys.forEach(key =>
      this.getObjectPlacement()
        .getInputManager()
        .registerKeyboardListener(key, 'up', () => {
          this.deleteActiveSelection();
          this.deselect();
        })
    );
  }

  private deleteActiveSelection() {
    if (!this.activeSelection) return;
    switch (this.getType(this.activeSelection)) {
      case 'object':
        this.getObjectPlacement().deleteObj(this.activeSelection);
        break;
      case 'bbox':
        this.getObjectPlacement().deleteBBox(this.activeSelection);
        break;
    }
    this.activeSelection.destroy();
  }

  private getType(gameObject: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image) {
    return this.activeSelection?.data.get('type');
  }
}
