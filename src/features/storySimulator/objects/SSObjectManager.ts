import ObjectPlacement from '../scenes/ObjectPlacement/ObjectPlacement';
import { Constants, screenCenter } from 'src/features/game/commons/CommonConstants';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { ObjectDetail, ShortPath } from './SSObjectManagerTypes';
import { ItemId, AssetKey } from 'src/features/game/commons/CommonsTypes';
import { generateItemId } from './SSObjectManagerHelper';

export default class SSObjectManager {
  private objectPlacement: ObjectPlacement | undefined;
  private objectIdNumber: number;
  private objectSpriteMap: Map<ItemId, ObjectDetail>;
  private assetMap: Map<AssetKey, ShortPath>;

  constructor() {
    this.objectIdNumber = 0;
    this.objectSpriteMap = new Map<ItemId, ObjectDetail>();
    this.assetMap = new Map<AssetKey, ShortPath>();
  }

  public initialise(objectPlacement: ObjectPlacement) {
    this.objectPlacement = objectPlacement;
    this.objectIdNumber = 0;
    this.objectSpriteMap = new Map<ItemId, ObjectDetail>();
    this.trackDraggables();
  }

  private trackDraggables() {
    this.getObjectPlacement().input.on(
      'drag',
      (_: MouseEvent, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
        const itemId = gameObject.data.get('itemId');

        const objectDetail = this.objectSpriteMap.get(itemId);
        if (!objectDetail) return;
        objectDetail.x = dragX;
        objectDetail.y = dragY;
      }
    );
  }

  public loadObject() {
    const shortPath = sessionStorage.getItem('selectedAsset');
    if (!shortPath) return;
    const objectAssetKey = `#${shortPath}`;
    this.assetMap.set(objectAssetKey, shortPath);

    this.getObjectPlacement().load.image(objectAssetKey, Constants.assetsFolder + shortPath);
    this.getObjectPlacement().load.once('filecomplete', (objectAssetKey: string) => {
      this.renderObject(objectAssetKey);
    });
    this.getObjectPlacement().load.start();
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
    const itemId = generateItemId(objectAssetKey, this.objectIdNumber);
    objectSprite.data.set('itemId', itemId);

    const shortPath = this.assetMap.get(objectAssetKey);
    if (!shortPath) {
      throw new Error('Object short path not recorded');
    }

    this.objectSpriteMap.set(itemId, {
      id: itemId,
      assetKey: objectAssetKey,
      assetPath: shortPath,
      x: screenCenter.x,
      y: screenCenter.y
    });

    this.getObjectPlacement().layerManager.addToLayer(Layer.Objects, objectSprite);
    this.objectIdNumber++;
  }

  public printMap() {
    this.objectSpriteMap.forEach((objectDetail: ObjectDetail) => {
      const objectDetailString = [
        objectDetail.id,
        objectDetail.assetPath,
        objectDetail.x.toString(),
        objectDetail.y.toString()
      ].join(',');
      console.log(objectDetailString);
    });
  }

  private getObjectPlacement() {
    if (!this.objectPlacement) {
      throw new Error('No object placement parent scene');
    }
    return this.objectPlacement;
  }
}
