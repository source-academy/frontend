import GameUserStateManager from '../state/GameUserStateManager';
import { CollectiblePage } from './CollectiblesTypes';
import { collectiblesMenu, collectiblesPage } from '../commons/CommonAssets';
import GameLayerManager from '../layer/GameLayerManager';
import { Layer } from '../layer/GameLayerTypes';

class CollectiblesManager {
  private scene: Phaser.Scene | undefined;
  private currCollectiblePage: CollectiblePage;
  private userStateManager: GameUserStateManager | undefined;
  private layerManager: GameLayerManager | undefined;

  constructor() {
    this.currCollectiblePage = CollectiblePage.Collectibles;
  }

  public initialise(
    scene: Phaser.Scene,
    userStateManager: GameUserStateManager,
    layerManager: GameLayerManager
  ) {
    this.scene = scene;
    this.userStateManager = userStateManager;
    this.layerManager = layerManager;
  }

  public createCollectibleMenu() {
    const collectibleContainer = new Phaser.GameObjects.Container(this.getScene(), 0, 0);
    const collectiblesBg = new Phaser.GameObjects.Image(
      this.getScene(),
      0,
      0,
      collectiblesMenu.key
    );
    collectibleContainer.add(collectiblesBg);

    // Add options
    for (const page in CollectiblePage) {
      const pageOptContainer = this.addPageBanner(page, () => {
        this.currCollectiblePage = page as CollectiblePage;
      });
      collectibleContainer.add(pageOptContainer);
    }

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

  private getUserStateManager() {
    if (!this.userStateManager) {
      throw console.error('Undefined User State Manager');
    }
    return this.userStateManager;
  }

  private getLayerManager() {
    if (!this.layerManager) {
      throw console.error('Undefined Layer Manager');
    }
    return this.layerManager;
  }

  private addPageBanner(text: string, callback: any) {
    const pageBannerContainer = new Phaser.GameObjects.Container(this.getScene(), 0, 0);
    const pageBannerBg = new Phaser.GameObjects.Sprite(this.getScene(), 0, 0, collectiblesPage.key);
    const pageBannerText = new Phaser.GameObjects.Text(this.getScene(), 0, 0, text, {});
    pageBannerBg.setInteractive({ pixelPerfect: true, useHandCursor: true });
    pageBannerBg.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, callback);
    pageBannerContainer.add([pageBannerBg, pageBannerText]);
    return pageBannerContainer;
  }

  private getCollectibles() {
    return this.getUserStateManager().getList('collectibles');
  }

  private getAchievements() {
    return this.getUserStateManager().getList('achievements');
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

export default CollectiblesManager;
