import ObjectPlacement from '../scenes/ObjectPlacement/ObjectPlacement';
import { CursorMode } from '../cursorMode/SSCursorModeTypes';
import { resizeRect } from 'src/features/game/utils/SpriteUtils';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { Color, hex } from 'src/features/game/utils/StyleUtils';
import { ICheckpointLogger } from '../logger/SSLogManagerTypes';

export default class SSBBoxManager implements ICheckpointLogger {
  public checkpointTitle = 'boundingBoxes';

  private objectPlacement: ObjectPlacement | undefined;
  private bboxBeingDrawn: Phaser.GameObjects.Rectangle | undefined;
  private startingCoordinates: number[] | undefined;

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
        objectPlacement.input.setDraggable(this.bboxBeingDrawn);
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
      hex(Color.white)
    )
      .setOrigin(0)
      .setAlpha(0.1)
      .setInteractive()
      .setDataEnabled();

    this.startingCoordinates = [x, y];
    this.getObjectPlacement().layerManager.addToLayer(Layer.BBox, bboxBeingDrawn);
    return bboxBeingDrawn;
  }

  private getObjectPlacement() {
    if (!this.objectPlacement) {
      throw new Error('No object placement parent scene');
    }
    return this.objectPlacement;
  }

  public resize(objectPlacement: ObjectPlacement) {
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
    resizeRect(this.bboxBeingDrawn, currentX - startX, currentY - startY);
  }

  public checkpointTxtLog() {
    return '';
  }
}
