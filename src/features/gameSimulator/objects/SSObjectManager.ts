import { screenCenter } from 'src/features/game/commons/CommonConstants';
import { AssetKey, ItemId } from 'src/features/game/commons/CommonTypes';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { mandatory, toS3Path } from 'src/features/game/utils/GameUtils';
import StringUtils from 'src/features/game/utils/StringUtils';

import { loadImage } from '../../game/utils/LoaderUtils';
import { getIdFromShortPath } from '../logger/SSLogManagerHelper';
import { ICheckpointLoggable } from '../logger/SSLogManagerTypes';
import ObjectPlacement from '../scenes/ObjectPlacement/ObjectPlacement';
import { SSObjectDetail } from './SSObjectManagerTypes';

/**
 * This manager manages the object (image assets) for Story Simulator's Object Placement scene
 *
 * It handles:
 * (1) Storing of information on image assets used
 * (2) Creation of image assets by taking the image name from browser storage
 * (3) Rendering of image assets onto screen
 */
export default class SSObjectManager implements ICheckpointLoggable {
  public checkpointTitle = 'objects';

  private objectPlacement: ObjectPlacement | undefined;
  private objectDetailMap: Map<ItemId, SSObjectDetail>;

  constructor() {
    this.objectDetailMap = new Map<ItemId, SSObjectDetail>();
  }

  public initialise(objectPlacement: ObjectPlacement) {
    this.objectPlacement = objectPlacement;
    this.objectDetailMap = new Map<ItemId, SSObjectDetail>();
  }

  /**
   * Takes the image path from the session storage
   * and renders the image on screen
   */
  public async loadObject() {
    const shortPath = sessionStorage.getItem('selectedAsset');
    if (!shortPath) return;
    const objectAssetKey = `#${shortPath}`;
    this.getObjectPlacement().addAsset(objectAssetKey, shortPath);

    const assetKeyOnLoad = await loadImage(
      this.getObjectPlacement(),
      objectAssetKey,
      toS3Path(shortPath, true)
    );
    this.renderObject(assetKeyOnLoad);
  }

  /**
   * Helper to renders the object in the middle of the screen
   *
   * @param objectAssetKey asset key of the image used for the object
   */
  private renderObject(objectAssetKey: string) {
    if (objectAssetKey[0] !== '#') {
      return;
    }
    const objectSprite = new Phaser.GameObjects.Image(
      this.getObjectPlacement(),
      screenCenter.x,
      screenCenter.y,
      objectAssetKey
    )
      .setInteractive()
      .setDataEnabled();
    this.getObjectPlacement().input.setDraggable(objectSprite);
    this.getObjectPlacement().getLayerManager().addToLayer(Layer.Objects, objectSprite);

    this.registerObject(objectAssetKey, objectSprite);
  }

  /**
   * Helper to record down information on the object that has been placed onto the scene
   *
   * @param objectAssetKey
   * @param objectSprite
   */
  private registerObject(objectAssetKey: AssetKey, objectSprite: Phaser.GameObjects.Image) {
    const itemId = this.generateItemId(
      objectAssetKey,
      this.getObjectPlacement().generateItemIdNumber()
    );

    const assetShortPath = mandatory(this.getObjectPlacement().getAssetPath(objectAssetKey));

    const objectDetail: SSObjectDetail = {
      id: itemId,
      assetKey: objectAssetKey,
      assetPath: assetShortPath,
      x: screenCenter.x,
      y: screenCenter.y
    };

    this.objectDetailMap.set(itemId, objectDetail);

    objectSprite.data.set('itemId', itemId);
    objectSprite.data.set('type', 'object');

    this.getObjectPlacement().setActiveSelection(objectSprite);
  }

  /**
   * Helper to generate a default id for this object
   *
   * @param assetKey
   * @param objectIdNumber
   */
  private generateItemId(assetKey: string, objectIdNumber: number) {
    const itemName = getIdFromShortPath(assetKey);
    return `${itemName}${objectIdNumber}`;
  }

  /**
   * Returns the list of objects details for logging information
   * into info-boxes by LogManager
   */
  public getLoggables() {
    return [...this.objectDetailMap.values()];
  }

  /**
   * This function is called when printing the checkpoint text file
   *
   * Provides the array of strings that are associated with the `objects` entity
   * that are printed within the location paragraph.
   */
  public checkpointTxtLog() {
    return Array.from(this.objectDetailMap.values()).map((objectDetail: SSObjectDetail) => {
      const objectDetailArray = [
        '+' + objectDetail.id,
        objectDetail.assetPath,
        StringUtils.toIntString(objectDetail.x),
        StringUtils.toIntString(objectDetail.y)
      ];
      if (objectDetail.width) {
        objectDetailArray.push(StringUtils.toIntString(objectDetail.width));
        objectDetailArray.push(StringUtils.toIntString(objectDetail.height!));
      }
      return objectDetailArray.join(', ');
    });
  }

  private getObjectPlacement = () => mandatory(this.objectPlacement);

  /**
   * This function receives any transformation updates on objects
   * from Transformation manager and stores information internally in its `objectDetailMap`
   *
   * @param gameObject bounding box being updated
   * @param attribute attributes being updated for that bbox
   * @param value value to set this attribute to
   */
  public setAttribute(
    gameObject: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle,
    attribute: string,
    value: number
  ) {
    const itemId = gameObject.data.get('itemId');
    const itemDetail = this.objectDetailMap.get(itemId);
    if (!itemDetail) return;
    itemDetail[attribute] = value;
  }

  public deleteAll() {
    this.objectDetailMap.clear();
  }

  public delete(gameObject: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle) {
    const itemId = gameObject.data.get('itemId');
    this.objectDetailMap.delete(itemId);
  }
}
