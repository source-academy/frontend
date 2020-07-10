import { CollectiblePage, CollectibleProperty } from './GameCollectiblesTypes';
import GameLayerManager from '../layer/GameLayerManager';
import { Layer } from '../layer/GameLayerTypes';
import { screenCenter } from '../commons/CommonConstants';
import {
  pageBannerYStartPos,
  pageBannerYSpacing,
  pageBannerTextXPos,
  pageBannerTextStyle,
  listBannerYStartPos,
  listBannerYSpacing,
  listBannerTextXPos,
  listBannerTextStyle,
  arrowXMidPos,
  arrowDownYPos,
  arrowXScale,
  arrowYScale,
  itemsPerPage,
  arrowXOffset,
  offHoverAlpha,
  onHoverAlpha,
  collectiblePreviewXPos,
  collectiblePreviewYPos,
  collectiblePreviewDim,
  collectibleTitleStyle,
  collectibleDescStyle,
  defaultCollectibleProp,
  collectibleTitleYOffset,
  collectibleDescYOffset
} from './GameCollectiblesConstants';
import { resize } from '../utils/SpriteUtils';
import { createBitmapText } from '../utils/TextUtils';
import ImageAssets from '../assets/ImageAssets';

class GameCollectiblesManager {
  private scene: Phaser.Scene | undefined;
  private currCollectiblePage: CollectiblePage;
  private layerManager: GameLayerManager | undefined;
  private collectibleContainer: Phaser.GameObjects.Container | undefined;
  private listContainer: Phaser.GameObjects.Container | undefined;
  private previewSprite: Phaser.GameObjects.Sprite | undefined;
  private previewTitle: Phaser.GameObjects.BitmapText | undefined;
  private previewDesc: Phaser.GameObjects.Text | undefined;
  private pageNumber: Map<CollectiblePage, number>;

  constructor() {
    this.currCollectiblePage = CollectiblePage.Collectibles;
    this.pageNumber = new Map<CollectiblePage, number>();
  }

  public initialise(scene: Phaser.Scene, layerManager: GameLayerManager) {
    this.scene = scene;
    this.layerManager = layerManager;

    // Set initial page number to zero
    this.pageNumber.clear();
    Object.keys(CollectiblePage).forEach((page, index) => {
      const pageName = page as CollectiblePage;
      this.pageNumber.set(pageName, 0);
    });
  }

  public renderCollectibleMenu() {
    // Refresh everything
    this.destroyCollectibleMenu();

    this.collectibleContainer = new Phaser.GameObjects.Container(
      this.getScene(),
      screenCenter.x,
      screenCenter.y
    );
    const collectiblesBg = new Phaser.GameObjects.Image(
      this.getScene(),
      0,
      0,
      ImageAssets.collectiblesMenu.key
    );
    this.collectibleContainer.add(collectiblesBg);

    // Add options
    Object.keys(CollectiblePage).forEach((page, index) => {
      const isChosen = page === (this.currCollectiblePage as string);
      const pageOptContainer = this.addPageBanner(page, index, isChosen, () => {
        const newPage = page as CollectiblePage;
        if (newPage !== this.currCollectiblePage) {
          this.currCollectiblePage = page as CollectiblePage;
          this.renderCollectibleMenu();
        }
      });
      this.collectibleContainer!.add(pageOptContainer);
    });

    // Add arrows
    const arrowLeft = new Phaser.GameObjects.Sprite(
      this.getScene(),
      arrowXMidPos - arrowXOffset,
      arrowDownYPos,
      ImageAssets.arrow.key
    )
      .setScale(arrowXScale, arrowYScale)
      .setRotation((-90 * Math.PI) / 180)
      .setAlpha(offHoverAlpha);

    const arrowRight = new Phaser.GameObjects.Sprite(
      this.getScene(),
      arrowXMidPos + arrowXOffset,
      arrowDownYPos,
      ImageAssets.arrow.key
    )
      .setScale(arrowXScale, arrowYScale)
      .setRotation((90 * Math.PI) / 180)
      .setAlpha(offHoverAlpha);

    this.setArrowFunctionality(arrowLeft, async () => await this.nextPage(false));
    this.setArrowFunctionality(arrowRight, async () => await this.nextPage(true));
    this.collectibleContainer.add([arrowLeft, arrowRight]);

    // Add object list
    this.listContainer = this.getCurrentPage(
      this.currCollectiblePage,
      this.pageNumber.get(this.currCollectiblePage)!
    );
    this.collectibleContainer.add(this.listContainer);

    // Add preview
    const frame = new Phaser.GameObjects.Sprite(
      this.getScene(),
      collectiblePreviewXPos,
      collectiblePreviewYPos,
      ImageAssets.popUpFrame.key
    ).setScale(1.2);
    this.previewSprite = new Phaser.GameObjects.Sprite(
      this.getScene(),
      collectiblePreviewXPos,
      collectiblePreviewYPos,
      ImageAssets.cookies.key
    ).setOrigin(0.428, 0.468);
    this.previewTitle = createBitmapText(
      this.getScene(),
      '',
      collectiblePreviewXPos,
      collectiblePreviewYPos + collectibleTitleYOffset,
      collectibleTitleStyle
    ).setOrigin(0.35, 0.5);
    this.previewDesc = new Phaser.GameObjects.Text(
      this.getScene(),
      collectiblePreviewXPos,
      collectiblePreviewYPos + collectibleDescYOffset,
      '',
      collectibleDescStyle
    ).setOrigin(0.45, 0.0);
    this.collectibleContainer.add([frame, this.previewSprite, this.previewTitle, this.previewDesc]);

    this.getLayerManager().addToLayer(Layer.UI, this.collectibleContainer);

    // Set default preview
    this.setPreview('', defaultCollectibleProp, '');
  }

  private setPreview(title: string, prop: CollectibleProperty, description: string = '') {
    const isAllValid =
      this.collectibleContainer && this.previewSprite && this.previewDesc && this.previewTitle;
    if (!isAllValid) return;

    const preview = new Phaser.GameObjects.Sprite(this.getScene(), 0, 0, prop.assetKey);
    if (preview.displayWidth > preview.displayHeight) {
      resize(preview, collectiblePreviewDim);
    } else {
      resize(preview, 0, collectiblePreviewDim);
    }
    preview
      .setPosition(this.previewSprite!.x, this.previewSprite!.y)
      .setOrigin(this.previewSprite!.originX, this.previewSprite!.originY);
    this.previewSprite!.destroy();
    this.previewSprite = preview;
    this.collectibleContainer!.add(this.previewSprite);

    // Set text and description
    this.previewTitle!.setText(title);
    this.previewDesc!.setText(description);
  }

  private setArrowFunctionality(arrow: Phaser.GameObjects.Sprite, callback: Function) {
    arrow.setInteractive({ pixelPerfect: true, useHandCursor: true });
    arrow.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, callback);
    arrow.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
      arrow.setAlpha(onHoverAlpha);
    });
    arrow.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
      arrow.setAlpha(offHoverAlpha);
    });
  }

  private nextPage(next: boolean) {
    const currPageNum = this.pageNumber.get(this.currCollectiblePage)!;
    const newPageNum = next ? currPageNum + 1 : currPageNum - 1;
    if (!this.listContainer || !this.collectibleContainer || newPageNum < 0) return;

    const newListContainer = this.getCurrentPage(this.currCollectiblePage, newPageNum);
    if (newListContainer.length > 0) {
      this.listContainer.destroy();
      this.listContainer = newListContainer;
      this.collectibleContainer.add(this.listContainer);
      this.pageNumber.set(this.currCollectiblePage, newPageNum);
    }
  }

  public destroyCollectibleMenu() {
    if (this.collectibleContainer) this.collectibleContainer.destroy();
    if (this.listContainer) this.listContainer.destroy();
    if (this.previewSprite) this.previewSprite.destroy();
    if (this.previewTitle) this.previewTitle.destroy();
    if (this.previewDesc) this.previewDesc.destroy();
  }

  private getScene() {
    if (!this.scene) {
      throw console.error('Undefined scene');
    }
    return this.scene;
  }

  private getLayerManager() {
    if (!this.layerManager) {
      throw console.error('Undefined Layer Manager');
    }
    return this.layerManager;
  }

  private addPageBanner(text: string, index: number, isChosen: boolean, callback: any) {
    const pageBannerContainer = new Phaser.GameObjects.Container(this.getScene(), 0, 0);
    const bannerYPos = pageBannerYStartPos + index * pageBannerYSpacing;
    const pageBannerBg = new Phaser.GameObjects.Sprite(
      this.getScene(),
      0,
      bannerYPos,
      ImageAssets.collectiblesPage.key
    );

    const pageBannerChosen = new Phaser.GameObjects.Sprite(
      this.getScene(),
      0,
      bannerYPos,
      ImageAssets.collectiblesPageChosen.key
    );

    const bannerTextYPos = pageBannerYStartPos + index * pageBannerYSpacing;
    const pageBannerText = createBitmapText(
      this.getScene(),
      text,
      pageBannerTextXPos,
      bannerTextYPos,
      pageBannerTextStyle
    )
      .setLetterSpacing(5)
      .setOrigin(0.1, 0.5);

    pageBannerBg.setInteractive({ pixelPerfect: true, useHandCursor: true });
    pageBannerBg.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, callback);
    pageBannerContainer.add([pageBannerBg, pageBannerText]);
    if (isChosen) pageBannerContainer.add(pageBannerChosen);

    return pageBannerContainer;
  }

  private getCollectibles() {
    return ['collect1', 'collect2'];
  }

  private getAchievements() {
    return [
      'achievement1',
      'achievement2',
      'achievement3',
      'achievement4',
      'achievement5',
      'achievement6',
      'achievement7',
      'achievement8',
      'achievement9',
      'achievement10',
      'achievement11',
      'achievement12'
    ];
  }

  private getCurrentPage(page: CollectiblePage, pageNum: number) {
    let objectList: string[];
    switch (page) {
      case CollectiblePage.Achievements:
        objectList = this.getAchievements();
        break;
      case CollectiblePage.Collectibles:
        objectList = this.getCollectibles();
        break;
      default:
        objectList = [];
    }

    const pageContainer = new Phaser.GameObjects.Container(this.getScene(), 0, 0);
    const startingIdx = pageNum * itemsPerPage;
    const endingIdx = startingIdx + itemsPerPage;

    if (startingIdx < objectList.length) {
      for (let i = startingIdx; i < objectList.length && i < endingIdx; i++) {
        const objContainer = this.createObjContainer(objectList[i], i - startingIdx, () => {
          // TODO: Use actual collectible prop
          this.setPreview(objectList[i], defaultCollectibleProp);
        });
        pageContainer.add(objContainer);
      }
    }

    return pageContainer;
  }

  private createObjContainer(obj: string, index: number, callback: any) {
    const container = new Phaser.GameObjects.Container(this.getScene(), 0, 0);
    const objBannerYPos = listBannerYStartPos + index * listBannerYSpacing;

    const objListBg = new Phaser.GameObjects.Sprite(
      this.getScene(),
      0,
      objBannerYPos,
      ImageAssets.collectiblesBanner.key
    );
    const objListText = createBitmapText(
      this.getScene(),
      obj,
      listBannerTextXPos,
      objBannerYPos,
      listBannerTextStyle
    ).setOrigin(0.0, 0.55);

    objListBg.setInteractive({ pixelPerfect: true, useHandCursor: true });
    objListBg.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, callback);

    container.add([objListBg, objListText]);
    return container;
  }
}

export default GameCollectiblesManager;
