import { CollectiblePage } from './GameCollectiblesTypes';
import {
  collectiblesMenu,
  collectiblesPage,
  collectiblesPageChosen,
  collectiblesBanner,
  arrow
} from '../commons/CommonAssets';
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
  onHoverAlpha
} from './GameCollectiblesConstants';

class GameCollectiblesManager {
  private scene: Phaser.Scene | undefined;
  private currCollectiblePage: CollectiblePage;
  private layerManager: GameLayerManager | undefined;
  private collectibleContainer: Phaser.GameObjects.Container | undefined;
  private listContainer: Phaser.GameObjects.Container | undefined;
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
    if (this.collectibleContainer) this.collectibleContainer.destroy();
    if (this.listContainer) this.listContainer.destroy();

    const collectibleContainer = new Phaser.GameObjects.Container(
      this.getScene(),
      screenCenter.x,
      screenCenter.y
    );
    const collectiblesBg = new Phaser.GameObjects.Image(
      this.getScene(),
      0,
      0,
      collectiblesMenu.key
    );
    collectibleContainer.add(collectiblesBg);

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
      collectibleContainer.add(pageOptContainer);
    });

    // Add arrows
    const arrowLeft = new Phaser.GameObjects.Sprite(
      this.getScene(),
      arrowXMidPos - arrowXOffset,
      arrowDownYPos,
      arrow.key
    )
      .setScale(arrowXScale, arrowYScale)
      .setRotation((-90 * Math.PI) / 180)
      .setAlpha(offHoverAlpha);

    const arrowRight = new Phaser.GameObjects.Sprite(
      this.getScene(),
      arrowXMidPos + arrowXOffset,
      arrowDownYPos,
      arrow.key
    )
      .setScale(arrowXScale, arrowYScale)
      .setRotation((90 * Math.PI) / 180)
      .setAlpha(offHoverAlpha);

    arrowLeft.setInteractive({ pixelPerfect: true, useHandCursor: true });
    arrowLeft.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, async () => {
      await this.scrollPage(false);
    });
    arrowLeft.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
      arrowLeft.setAlpha(onHoverAlpha);
    });
    arrowLeft.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
      arrowLeft.setAlpha(offHoverAlpha);
    });

    arrowRight.setInteractive({ pixelPerfect: true, useHandCursor: true });
    arrowRight.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, async () => {
      await this.scrollPage(true);
    });
    arrowRight.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
      arrowRight.setAlpha(onHoverAlpha);
    });
    arrowRight.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
      arrowRight.setAlpha(offHoverAlpha);
    });

    collectibleContainer.add([arrowLeft, arrowRight]);

    // Add object list
    this.listContainer = this.getCurrentPage(
      this.currCollectiblePage,
      this.pageNumber.get(this.currCollectiblePage)!
    );
    collectibleContainer.add(this.listContainer);

    this.collectibleContainer = collectibleContainer;
    this.getLayerManager().addToLayer(Layer.UI, this.collectibleContainer);
  }

  private scrollPage(next: boolean) {
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
      collectiblesPage.key
    );

    const pageBannerChosen = new Phaser.GameObjects.Sprite(
      this.getScene(),
      0,
      bannerYPos,
      collectiblesPageChosen.key
    );

    const bannerTextYPos = pageBannerYStartPos + index * pageBannerYSpacing;
    const pageBannerText = new Phaser.GameObjects.BitmapText(
      this.getScene(),
      pageBannerTextXPos,
      bannerTextYPos,
      pageBannerTextStyle.key,
      text,
      pageBannerTextStyle.size,
      pageBannerTextStyle.align
    )
      .setTintFill(pageBannerTextStyle.fill)
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
        const objContainer = this.createObjContainer(objectList[i], i - startingIdx, () => {});
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
      collectiblesBanner.key
    );
    const objListText = new Phaser.GameObjects.BitmapText(
      this.getScene(),
      listBannerTextXPos,
      objBannerYPos,
      listBannerTextStyle.key,
      obj,
      listBannerTextStyle.size,
      listBannerTextStyle.align
    )
      .setTintFill(listBannerTextStyle.fill)
      .setOrigin(0.0, 0.55);

    objListBg.setInteractive({ pixelPerfect: true, useHandCursor: true });
    objListBg.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, callback);

    container.add([objListBg, objListText]);
    return container;
  }
}

export default GameCollectiblesManager;
