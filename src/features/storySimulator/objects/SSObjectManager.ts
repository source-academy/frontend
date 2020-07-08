import ObjectPlacement from '../scenes/ObjectPlacement/ObjectPlacement';
import { Constants, screenCenter } from 'src/features/game/commons/CommonConstants';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { SSObjectDetail } from './SSObjectManagerTypes';
import { ItemId, AssetKey } from 'src/features/game/commons/CommonTypes';
import { toIntString } from '../utils/SSUtils';
import { loadImage } from '../../game/utils/LoaderUtils';
import { getIdFromShortPath } from '../logger/SSLogManagerHelper';
import { ICheckpointLoggable } from '../logger/SSLogManagerTypes';
import { mapValues } from 'src/features/game/utils/GameUtils';

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

  public async loadObject() {
    const shortPath = sessionStorage.getItem('selectedAsset');
    if (!shortPath) return;
    const objectAssetKey = `#${shortPath}`;
    this.getObjectPlacement().addAsset(objectAssetKey, shortPath);

    const assetKeyOnLoad = await loadImage(
      this.getObjectPlacement(),
      objectAssetKey,
      Constants.assetsFolder + shortPath
    );
    this.renderObject(assetKeyOnLoad);
  }

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
    this.getObjectPlacement().layerManager.addToLayer(Layer.Objects, objectSprite);

    this.registerObject(objectAssetKey, objectSprite);
  }

  private registerObject(objectAssetKey: AssetKey, objectSprite: Phaser.GameObjects.Image) {
    const itemId = this.generateItemId(
      objectAssetKey,
      this.getObjectPlacement().generateItemIdNumber()
    );

    const assetShortPath = this.getObjectPlacement().getAssetPath(objectAssetKey);
    if (!assetShortPath) {
      throw new Error('Object asset path not recorded');
    }

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

  private generateItemId(assetKey: string, objectIdNumber: number) {
    const itemName = getIdFromShortPath(assetKey);
    return `${itemName}${objectIdNumber}`;
  }

  public getLoggables() {
    return [...this.objectDetailMap.values()];
  }

  public checkpointTxtLog() {
    return Array.from(
      mapValues(this.objectDetailMap, (objectDetail: SSObjectDetail) => {
        const objectDetailArray = [
          '+' + objectDetail.id,
          objectDetail.assetPath,
          toIntString(objectDetail.x),
          toIntString(objectDetail.y)
        ];
        if (objectDetail.width) {
          objectDetailArray.push(toIntString(objectDetail.width));
          objectDetailArray.push(toIntString(objectDetail.height!));
        }
        return objectDetailArray.join(', ');
      }).values()
    );
  }

  private getObjectPlacement() {
    if (!this.objectPlacement) {
      throw new Error('No object placement parent scene');
    }
    return this.objectPlacement;
  }

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
