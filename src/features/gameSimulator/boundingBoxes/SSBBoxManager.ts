import { ItemId } from 'src/features/game/commons/CommonTypes';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { mandatory } from 'src/features/game/utils/GameUtils';
import { resize } from 'src/features/game/utils/SpriteUtils';
import StringUtils from 'src/features/game/utils/StringUtils';
import { HexColor } from 'src/features/game/utils/StyleUtils';

import { CursorMode } from '../cursorMode/SSCursorModeTypes';
import { ICheckpointLoggable } from '../logger/SSLogManagerTypes';
import ObjectPlacement from '../scenes/ObjectPlacement/ObjectPlacement';
import { SSBBoxDetail } from './SSBBoxManagerTypes';

/**
 * This manager manages the bounding boxes for Story Simulator's Object Placement scene
 *
 * It handles:
 * (1) Storing of information on bounding boxes
 * (2) Creation of bboxes using mouse drag
 * (3) Rendering of bboxes as translucent white boxes
 */
export default class SSBBoxManager implements ICheckpointLoggable {
  public checkpointTitle = 'boundingBoxes';

  private objectPlacement: ObjectPlacement | undefined;
  private bboxBeingDrawn: Phaser.GameObjects.Rectangle | undefined;
  private startingCoordinates: number[] | undefined;
  private bboxDetailMap: Map<ItemId, SSBBoxDetail>;

  constructor() {
    this.bboxDetailMap = new Map<ItemId, SSBBoxDetail>();
  }

  public initialise(objectPlacement: ObjectPlacement) {
    this.objectPlacement = objectPlacement;
    this.addBBoxListeners(objectPlacement);
  }

  /**
   * Adds pointer up and down listener on the object placement scene
   * in order to draw bboxes when the mode is bbox draw-mode
   *
   * Pointer down causes bbox to be drawn
   * Pointer up stops a bbox from being drawn
   *
   * @param objectPlacement the object placement scene
   */
  private addBBoxListeners(objectPlacement: ObjectPlacement) {
    this.getObjectPlacement()
      .getInputManager()
      .registerEventListener('pointerdown', () => {
        if (this.getObjectPlacement().isCursorMode(CursorMode.DrawBBox)) {
          this.bboxBeingDrawn = this.createNewBBox();
        }
      });

    this.getObjectPlacement()
      .getInputManager()
      .registerEventListener('pointerup', () => {
        if (this.getObjectPlacement().isCursorMode(CursorMode.DrawBBox) && this.bboxBeingDrawn) {
          if (this.bboxBeingDrawn.displayWidth <= 2 || this.bboxBeingDrawn.displayHeight <= 2) {
            this.bboxBeingDrawn.destroy();
            return;
          }
          this.bboxBeingDrawn.x += this.bboxBeingDrawn.displayWidth / 2;
          this.bboxBeingDrawn.y += this.bboxBeingDrawn.displayHeight / 2;
          this.bboxBeingDrawn.setOrigin(0.5);
          this.registerBBox(this.bboxBeingDrawn);

          objectPlacement.input.setDraggable(this.bboxBeingDrawn);
          this.getObjectPlacement().setActiveSelection(this.bboxBeingDrawn);

          this.startingCoordinates = undefined;
          this.bboxBeingDrawn = undefined;
        }
      });
  }

  /**
   * Draws a new bbox whose center is the center
   * created by the dragged bbox
   */
  private createNewBBox() {
    const [x, y] = this.getObjectPlacement().getCoordinates();
    const bboxBeingDrawn = new Phaser.GameObjects.Rectangle(
      this.getObjectPlacement(),
      x,
      y,
      1,
      1,
      HexColor.white
    )
      .setOrigin(0)
      .setAlpha(0.1)
      .setInteractive()
      .setDataEnabled();

    this.startingCoordinates = [x, y];
    this.getObjectPlacement().getLayerManager().addToLayer(Layer.BBox, bboxBeingDrawn);
    return bboxBeingDrawn;
  }

  /**
   * Memorises the dimensions and coordinates of the drawn
   * bbox and stores this information
   */
  private registerBBox(bboxSprite: Phaser.GameObjects.Rectangle) {
    const itemId = 'bbox' + this.getObjectPlacement().generateItemIdNumber();

    const objectDetail: SSBBoxDetail = {
      id: itemId,
      x: bboxSprite.x,
      y: bboxSprite.y,
      width: bboxSprite.displayWidth,
      height: bboxSprite.displayHeight
    };

    this.bboxDetailMap.set(itemId, objectDetail);

    bboxSprite.data.set('itemId', itemId);
    bboxSprite.data.set('type', 'bbox');
  }

  /**
   * Returns an array of bounding box details for logging information
   * into info-boxes by LOg Manager
   */
  public getLoggables() {
    return [...this.bboxDetailMap.values()];
  }

  public getItemById(itemId: ItemId) {
    return this.bboxDetailMap.get(itemId);
  }

  private getObjectPlacement = () => mandatory(this.objectPlacement);

  /**
   * This function resizes the bbox that is currently being drawn,
   * so that users can see the effects of drawing a rectangle in real-time.
   *
   * @param objectPlacement the bbox being drawn
   */
  public resizeWhileBeingDrawn(objectPlacement: ObjectPlacement) {
    if (
      !this.getObjectPlacement().isCursorMode(CursorMode.DrawBBox) ||
      !this.startingCoordinates ||
      !this.bboxBeingDrawn
    ) {
      return;
    }
    const [startX, startY] = this.startingCoordinates;
    const currentX = objectPlacement.input.x;
    const currentY = objectPlacement.input.y;
    resize(this.bboxBeingDrawn, currentX - startX, currentY - startY);
  }

  /**
   * This function is called when printing the checkpoint text file
   *
   * Provides the array of strings that are associated with the `boundingBoxes` entity
   * that are printed within the location paragraph.
   */
  public checkpointTxtLog() {
    const map: string[] = [];
    this.bboxDetailMap.forEach((bboxDetail: SSBBoxDetail) => {
      const bboxDetailArray = [
        '+' + bboxDetail.id,
        StringUtils.toIntString(bboxDetail.x),
        StringUtils.toIntString(bboxDetail.y),
        StringUtils.toIntString(bboxDetail.width),
        StringUtils.toIntString(bboxDetail.height)
      ];

      map.push(bboxDetailArray.join(', '));
      map.push('    show_dialogue*(click)');
    });
    return map;
  }

  /**
   * This function receives any transformation updates on bboxes
   * from Transformation manager and stores information internally in its `bboxDetailMap`
   *
   * @param gameObject bounding box being updated
   * @param attribute attributes being updated for that bbox
   * @param value value to set this attribute to
   */
  public setAttribute(
    gameObject: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image,
    attribute: string,
    value: number
  ) {
    const itemId = gameObject.data.get('itemId');
    const bboxDetail = this.bboxDetailMap.get(itemId);
    if (!bboxDetail) return;
    bboxDetail[attribute] = value;
  }

  public deleteAll() {
    this.bboxDetailMap.clear();
  }

  public delete(gameObject: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle) {
    const itemId = gameObject.data.get('itemId');
    this.bboxDetailMap.delete(itemId);
  }
}
