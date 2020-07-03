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
  arrowXPos,
  arrowUpYPos,
  arrowDownYPos,
  arrowXScale,
  arrowYScale
} from './GameCollectiblesConstants';

class GameCollectiblesManager {
  private scene: Phaser.Scene | undefined;
  private currCollectiblePage: CollectiblePage;
  private layerManager: GameLayerManager | undefined;
  private collectibleContainer: Phaser.GameObjects.Container | undefined;
  private listContainer: Phaser.GameObjects.Container | undefined;

  constructor() {
    this.currCollectiblePage = CollectiblePage.Collectibles;
  }

  public initialise(scene: Phaser.Scene, layerManager: GameLayerManager) {
    this.scene = scene;
    this.layerManager = layerManager;
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
    const arrowUp = new Phaser.GameObjects.Sprite(
      this.getScene(),
      arrowXPos,
      arrowUpYPos,
      arrow.key
    ).setScale(arrowXScale, arrowYScale);
    const arrowDown = new Phaser.GameObjects.Sprite(
      this.getScene(),
      arrowXPos,
      arrowDownYPos,
      arrow.key
    )
      .setScale(arrowXScale, arrowYScale)
      .setFlipY(true);
    arrowUp.setInteractive({ pixelPerfect: true, useHandCursor: true, draggable: true });
    arrowDown.setInteractive({ pixelPerfect: true, useHandCursor: true, draggable: true });
    arrowUp.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      if (this.listContainer) this.listContainer.y -= 10;
    });
    arrowDown.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      if (this.listContainer) this.listContainer.y += 10;
    });

    collectibleContainer.add([arrowUp, arrowDown]);

    // Add object list
    this.listContainer = this.getCurrentPage(this.currCollectiblePage);
    collectibleContainer.add(this.listContainer);

    this.collectibleContainer = collectibleContainer;
    this.getLayerManager().addToLayer(Layer.UI, this.collectibleContainer);
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
    const pageBannerText = new Phaser.GameObjects.Text(
      this.getScene(),
      pageBannerTextXPos,
      bannerTextYPos,
      text,
      pageBannerTextStyle
    );
    pageBannerText.setOrigin(0.1, 0.55);

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
    return ['achievement1', 'achievement2', 'achievement3'];
  }

  private getCurrentPage(page: CollectiblePage) {
    let objectList: string[];
    switch (page) {
      case CollectiblePage.Achievements:
        objectList = this.getCollectibles();
        break;
      case CollectiblePage.Collectibles:
        objectList = this.getAchievements();
        break;
      default:
        objectList = [];
    }

    const pageContainer = new Phaser.GameObjects.Container(this.getScene(), 0, 0);
    objectList.forEach((obj, index) => {
      const objContainer = this.createObjContainer(obj, index, () => {});
      pageContainer.add(objContainer);
    });
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
    const objListText = new Phaser.GameObjects.Text(
      this.getScene(),
      listBannerTextXPos,
      objBannerYPos,
      obj,
      listBannerTextStyle
    );
    objListText.setOrigin(0.0, 0.55);

    objListBg.setInteractive({ pixelPerfect: true, useHandCursor: true });
    objListBg.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, callback);

    container.add([objListBg, objListText]);
    return container;
  }
}

export default GameCollectiblesManager;
