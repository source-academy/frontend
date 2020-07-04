import ObjectPlacement from '../scenes/ObjectPlacement/ObjectPlacement';
import { CursorMode } from '../cursorMode/SSCursorModeTypes';
import { resize } from 'src/features/game/utils/SpriteUtils';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { HexColor } from 'src/features/game/utils/StyleUtils';
import { ICheckpointLogger } from '../logger/SSLogManagerTypes';
import { ItemId } from 'src/features/game/commons/CommonsTypes';
import { SSBBoxDetail } from './SSBBoxManagerTypes';
import { toIntString } from '../utils/SSUtils';

export default class SSBBoxManager implements ICheckpointLogger {
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

  private addBBoxListeners(objectPlacement: ObjectPlacement) {
    const mouseDown = objectPlacement.input.on('pointerdown', () => {
      if (this.getObjectPlacement().isCursorMode(CursorMode.DrawBBox)) {
        this.bboxBeingDrawn = this.createNewBBox();
      }
    });
    const mouseUp = objectPlacement.input.on('pointerup', () => {
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

    this.getObjectPlacement().registerEventListeners([mouseDown, mouseUp]);
  }

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
    this.getObjectPlacement().layerManager.addToLayer(Layer.BBox, bboxBeingDrawn);
    return bboxBeingDrawn;
  }

  private registerBBox(bboxSprite: Phaser.GameObjects.Rectangle) {
    const itemId = 'bbox#' + this.getObjectPlacement().generateItemIdNumber();

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

  public getLoggables() {
    return [...this.bboxDetailMap.values()];
  }

  public getItemById(itemId: ItemId) {
    return this.bboxDetailMap.get(itemId);
  }

  private getObjectPlacement() {
    if (!this.objectPlacement) {
      throw new Error('No object placement parent scene');
    }
    return this.objectPlacement;
  }

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

  public checkpointTxtLog() {
    let map = '';
    this.bboxDetailMap.forEach((bboxDetail: SSBBoxDetail) => {
      const objectDetailArray = [
        '+' + bboxDetail.id,
        toIntString(bboxDetail.x),
        toIntString(bboxDetail.y),
        toIntString(bboxDetail.width),
        toIntString(bboxDetail.height)
      ];
      map += objectDetailArray.join(', ') + '\n';
    });
    return map;
  }

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
