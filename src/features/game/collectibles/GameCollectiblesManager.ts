import { CollectiblePage } from './GameCollectiblesTypes';
import {
  collectiblesMenu,
  collectiblesPage,
  collectiblesPageChosen
} from '../commons/CommonAssets';
import GameLayerManager from '../layer/GameLayerManager';
import { Layer } from '../layer/GameLayerTypes';
import { screenCenter } from '../commons/CommonConstants';
import {
  bannerYStartPos,
  bannerXSpacing,
  bannerTextXPos,
  bannerTextStyle
} from './GameCollectiblesConstants';

class GameCollectiblesManager {
  private scene: Phaser.Scene | undefined;
  private currCollectiblePage: CollectiblePage;
  private layerManager: GameLayerManager | undefined;

  constructor() {
    this.currCollectiblePage = CollectiblePage.Collectibles;
  }

  public initialise(scene: Phaser.Scene, layerManager: GameLayerManager) {
    this.scene = scene;
    this.layerManager = layerManager;
  }

  public renderCollectibleMenu() {
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
        this.currCollectiblePage = page as CollectiblePage;
      });
      collectibleContainer.add(pageOptContainer);
    });

    const activePage = this.getCurrentPage(this.currCollectiblePage);
    collectibleContainer.add(activePage);

    this.getLayerManager().addToLayer(Layer.UI, collectibleContainer);
  }

  public destroyCollectibleMenu() {}

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
    const bannerYPos = bannerYStartPos + index * bannerXSpacing;
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

    const bannerTextYPos = bannerYStartPos + index * bannerXSpacing;
    const pageBannerText = new Phaser.GameObjects.Text(
      this.getScene(),
      bannerTextXPos,
      bannerTextYPos,
      text,
      bannerTextStyle
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
    objectList.forEach(obj => {});
    return pageContainer;
  }
}

export default GameCollectiblesManager;
