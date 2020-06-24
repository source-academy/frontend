import ObjectPlacement from '../scenes/ObjectPlacement/ObjectPlacement';
import { Constants, screenCenter } from 'src/features/game/commons/CommonConstants';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { SSObjectDetail, ShortPath } from './SSObjectManagerTypes';
import { ItemId, AssetKey } from 'src/features/game/commons/CommonsTypes';
import { objectDetailStyle, resizePixels, activeSelectMargin } from './SSObjectManagerConstants';
import { shortButton } from 'src/features/storySimulator/utils/StorySimulatorAssets';
import { multiplyDimensions } from 'src/features/game/utils/SpriteUtils';
import { toIntString } from '../utils/SSUtils';

export default class SSObjectManager {
  private objectPlacement: ObjectPlacement | undefined;
  private objectIdNumber: number;
  private objectDetailMap: Map<ItemId, SSObjectDetail>;
  private assetMap: Map<AssetKey, ShortPath>;
  private objectDetailMapContainer: Phaser.GameObjects.Container | undefined;
  private activeSelection: Phaser.GameObjects.Image | undefined;
  private activeSelectRect: Phaser.GameObjects.Rectangle | undefined;

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
    this.drawActiveSelectRect();
    this.bindBracketsToResize();
  }

  private trackDraggables() {
    this.getObjectPlacement().input.on(
      'drag',
      (_: MouseEvent, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
        gameObject.x = dragX;
        gameObject.y = dragY;

        this.setAttribute(gameObject, 'x', dragX);
        this.setAttribute(gameObject, 'y', dragY);
        this.setActiveSelection(gameObject);
      }
    );
  }

  public loadObject() {
    const shortPath = sessionStorage.getItem('selectedAsset');
    if (!shortPath) return;
    const objectAssetKey = `#${shortPath}`;
    this.assetMap.set(objectAssetKey, shortPath);

    if (this.getObjectPlacement().textures.get(objectAssetKey).key !== '__MISSING') {
      this.renderObject(objectAssetKey);
    } else {
      this.getObjectPlacement().load.image(objectAssetKey, Constants.assetsFolder + shortPath);
      this.getObjectPlacement().load.once('filecomplete', (objectAssetKey: string) => {
        this.renderObject(objectAssetKey);
      });
      this.getObjectPlacement().load.start();
    }
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
    const itemId = this.generateItemId(objectAssetKey, this.objectIdNumber);
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

  private generateItemId(assetKey: string, objectIdNumber: number) {
    return `${assetKey}${objectIdNumber}`;
  }

  public showObjectDetailMap() {
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
      multiplyDimensions(rect, 1.2);
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

  private drawActiveSelectRect() {
    this.activeSelectRect = new Phaser.GameObjects.Rectangle(
      this.getObjectPlacement(),
      0,
      0,
      1,
      1,
      0
    ).setAlpha(0.3);
    this.getObjectPlacement().layerManager.addToLayer(Layer.Selector, this.activeSelectRect);
  }

  private formatObjectDetails(ssObjectDetail: SSObjectDetail) {
    let message = `${ssObjectDetail.assetPath}\nx: ${ssObjectDetail.x}\ny: ${ssObjectDetail.y}`;
    if (ssObjectDetail.width) {
      message += `\nwidth: ${ssObjectDetail.width}\nheight: ${ssObjectDetail.height}`;
    }
    return message;
  }

  public hideMap() {
    if (this.objectDetailMapContainer) {
      this.objectDetailMapContainer.destroy();
    }
  }

  public printObjectDetailMap() {
    console.log(this.getObjectDetailMap());
  }

  private getObjectDetailMap() {
    let map = '<<objects>>\n\n';
    this.objectDetailMap.forEach((objectDetail: SSObjectDetail) => {
      const objectDetailArray = [
        objectDetail.id,
        objectDetail.assetPath,
        toIntString(objectDetail.x),
        toIntString(objectDetail.y)
      ];
      if (objectDetail.width) {
        objectDetailArray.push(toIntString(objectDetail.width));
        objectDetailArray.push(toIntString(objectDetail.height!));
      }

      map += objectDetailArray.join(', ') + '\n';
    });
    return map;
  }

  private getObjectPlacement() {
    if (!this.objectPlacement) {
      throw new Error('No object placement parent scene');
    }
    return this.objectPlacement;
  }

  private bindBracketsToResize() {
    const openBracketKey = this.getObjectPlacement().input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.OPEN_BRACKET
    );
    openBracketKey.addListener('up', () => {
      this.resizeActive(false);
    });

    const closeBracketKey = this.getObjectPlacement().input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.CLOSED_BRACKET
    );
    closeBracketKey.addListener('up', () => {
      this.resizeActive(true);
    });

    this.getObjectPlacement().registerKeyboardListener(openBracketKey);
    this.getObjectPlacement().registerKeyboardListener(closeBracketKey);
  }

  private resizeActive(enlarge: boolean) {
    if (!this.activeSelection || !this.activeSelectRect) {
      return;
    }
    const enlargeBy = enlarge ? resizePixels : -resizePixels;
    this.activeSelection.displayWidth += enlargeBy;
    this.activeSelection.displayHeight += enlargeBy;

    this.activeSelectRect.displayWidth += enlargeBy;
    this.activeSelectRect.displayHeight += enlargeBy;

    this.setAttribute(this.activeSelection, 'width', this.activeSelection.displayWidth);
    this.setAttribute(this.activeSelection, 'height', this.activeSelection.displayHeight);
  }

  private setActiveSelection(gameObject: Phaser.GameObjects.Image) {
    if (!this.activeSelectRect) {
      return;
    }
    this.activeSelection = gameObject;
    this.activeSelectRect.x = gameObject.x;
    this.activeSelectRect.y = gameObject.y;
    this.activeSelectRect.displayHeight = gameObject.displayHeight + activeSelectMargin;
    this.activeSelectRect.displayWidth = gameObject.displayWidth + activeSelectMargin;
  }

  private setAttribute(gameObject: Phaser.GameObjects.Image, attribute: string, value: number) {
    const itemId = gameObject.data.get('itemId');
    const objectDetail = this.objectDetailMap.get(itemId);
    if (!objectDetail) return;
    objectDetail[attribute] = value;
  }
}
