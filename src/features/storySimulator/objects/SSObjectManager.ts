import ObjectPlacement from '../scenes/ObjectPlacement/ObjectPlacement';
import { Constants, screenCenter } from 'src/features/game/commons/CommonConstants';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { SSObjectDetail, ShortPath } from './SSObjectManagerTypes';
import { ItemId, AssetKey } from 'src/features/game/commons/CommonsTypes';
import { generateItemId } from './SSObjectManagerHelper';
import { shortButton } from 'src/features/game/commons/CommonAssets';
import { objectDetailStyle } from './SSObjectManagerConstants';

export default class SSObjectManager {
  private objectPlacement: ObjectPlacement | undefined;
  private objectIdNumber: number;
  private objectDetailMap: Map<ItemId, SSObjectDetail>;
  private assetMap: Map<AssetKey, ShortPath>;
  private objectDetailMapContainer: Phaser.GameObjects.Container | undefined;

  constructor() {
    this.objectIdNumber = 0;
    this.objectDetailMap = new Map<ItemId, SSObjectDetail>();
    this.assetMap = new Map<AssetKey, ShortPath>();
  }

  public initialise(objectPlacement: ObjectPlacement) {
    this.objectPlacement = objectPlacement;
    this.objectIdNumber = 0;
    this.objectDetailMap = new Map<ItemId, SSObjectDetail>();
    this.trackDraggables();
  }

  private trackDraggables() {
    this.getObjectPlacement().input.on(
      'drag',
      (_: MouseEvent, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
        const itemId = gameObject.data.get('itemId');

        const objectDetail = this.objectDetailMap.get(itemId);
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

    console.log(Constants.assetsFolder + shortPath);
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

    const objectDetail: SSObjectDetail = {
      id: itemId,
      assetKey: objectAssetKey,
      assetPath: shortPath,
      x: screenCenter.x,
      y: screenCenter.y
    };

    this.objectDetailMap.set(itemId, objectDetail);

    this.getObjectPlacement().layerManager.addToLayer(Layer.Objects, objectSprite);
    this.objectIdNumber++;
  }

  public showMap() {
    this.objectDetailMapContainer = new Phaser.GameObjects.Container(
      this.getObjectPlacement(),
      0,
      0
    );
    this.objectDetailMap.forEach((ssObjectDetail: SSObjectDetail) => {
      const rect = new Phaser.GameObjects.Image(
        this.getObjectPlacement(),
        ssObjectDetail.x,
        ssObjectDetail.y,
        shortButton.key
      );
      const mapShowText = new Phaser.GameObjects.Text(
        this.getObjectPlacement(),
        ssObjectDetail.x,
        ssObjectDetail.y,
        this.formatObjectDetails(ssObjectDetail),
        objectDetailStyle
      ).setOrigin(0.5);
      this.objectDetailMapContainer!.add([rect, mapShowText]);
    });
    this.getObjectPlacement().add.existing(this.objectDetailMapContainer);
  }

  private formatObjectDetails(ssObjectDetail: SSObjectDetail) {
    return `${ssObjectDetail.assetPath}\nx: ${ssObjectDetail.x}\ny: ${ssObjectDetail.y}`;
  }

  public hideMap() {
    if (this.objectDetailMapContainer) {
      this.objectDetailMapContainer.destroy();
    }
  }

  public printMap() {
    console.log(this.getObjectDetailMap());
  }

  private getObjectDetailMap() {
    let map = '';
    this.objectDetailMap.forEach((objectDetail: SSObjectDetail) => {
      const objectDetailString = [
        objectDetail.id,
        objectDetail.assetPath,
        objectDetail.x.toString(),
        objectDetail.y.toString()
      ].join(',');
      map += objectDetailString + '\n';
    });
    return map;
  }

  private getObjectPlacement() {
    if (!this.objectPlacement) {
      throw new Error('No object placement parent scene');
    }
    return this.objectPlacement;
  }
}
