import SourceAcademyGame from 'src/pages/academy/game/subcomponents/SourceAcademyGame';

import ImageAssets from '../assets/ImageAssets';
import SoundAssets from '../assets/SoundAssets';
import { screenCenter, screenSize } from '../commons/CommonConstants';
import { IBaseScene, IGameUI } from '../commons/CommonTypes';
import { fadeAndDestroy } from '../effects/FadeEffect';
import { entryTweenProps, exitTweenProps } from '../effects/FlyEffect';
import GameLayerManager from '../layer/GameLayerManager';
import { Layer } from '../layer/GameLayerTypes';
import GamePhaseManager from '../phase/GamePhaseManager';
import { GamePhaseType } from '../phase/GamePhaseTypes';
import { UserStateTypes } from '../state/GameStateTypes';
import GameUserStateManager from '../state/GameUserStateManager';
import { createButton } from '../utils/ButtonUtils';
import { limitNumber, mandatory, sleep } from '../utils/GameUtils';
import { resizeUnderflow } from '../utils/SpriteUtils';
import { calcListFormatPos } from '../utils/StyleUtils';
import { createBitmapText } from '../utils/TextUtils';
import collectibleConstants, {
  collectibleDescStyle,
  collectibleTitleStyle,
  defaultCollectibleProp,
  listBannerTextStyle,
  pageBannerTextStyle
} from './GameCollectiblesConstants';
import { CollectiblePage, CollectibleProperty } from './GameCollectiblesTypes';

/**
 * Manager for rendering collectibles and achievements popup in the location.
 */
class GameCollectiblesManager implements IGameUI {
  private scene: Phaser.Scene | undefined;
  private layerManager: GameLayerManager | undefined;
  private userStateManager: GameUserStateManager | undefined;
  private phaseManager: GamePhaseManager | undefined;
  private uiContainer: Phaser.GameObjects.Container | undefined;
  private previewContainer: Phaser.GameObjects.Container | undefined;
  private itemsContainer: Phaser.GameObjects.Container | undefined;
  private pageChosenContainer: Phaser.GameObjects.Container | undefined;
  private currActivePage: CollectiblePage;
  private activePageNumber: Map<CollectiblePage, number>;

  constructor() {
    this.activePageNumber = new Map<CollectiblePage, number>();
    this.currActivePage = CollectiblePage.Collectibles;
  }

  public initialise(
    scene: IBaseScene,
    userStateManager: GameUserStateManager,
    phaseManager: GamePhaseManager
  ) {
    this.scene = scene;
    this.layerManager = scene.layerManager;
    this.userStateManager = userStateManager;
    this.phaseManager = phaseManager;

    // Set initial page number to zero
    Object.keys(CollectiblePage).forEach((page, index) => {
      const pageName = page as CollectiblePage;
      this.activePageNumber.set(pageName, 0);
    });
  }

  private setPage(page: CollectiblePage) {
    if (this.uiContainer) {
      if (this.itemsContainer) this.itemsContainer.destroy();
      if (this.pageChosenContainer) this.pageChosenContainer.destroy();

      // Update
      this.currActivePage = page;
      this.itemsContainer = this.createItemsContainer();
      this.uiContainer.add(this.itemsContainer);

      // Set chosen page banner
      const bannerPos = this.getPageOptPositions();
      const chosenIdx = Object.keys(CollectiblePage).findIndex(pg => pg === (page as string));
      const bannerChosen = new Phaser.GameObjects.Sprite(
        this.getScene(),
        bannerPos[chosenIdx][0],
        bannerPos[chosenIdx][1] + collectibleConstants.pageYStartPos,
        ImageAssets.collectiblesPageChosen.key
      );
      this.pageChosenContainer = new Phaser.GameObjects.Container(this.getScene(), 0, 0, [
        bannerChosen
      ]);
      this.uiContainer.add(this.pageChosenContainer);

      // Set default preview
      this.setPreview('', defaultCollectibleProp, '');
    }
  }

  public async activateUI(): Promise<void> {
    this.uiContainer = this.createUIContainer();
    this.getLayerManager().addToLayer(Layer.UI, this.uiContainer);
    this.getSoundManager().playSound(SoundAssets.menuEnter.key);

    // Set initial page
    this.setPage(this.currActivePage);

    this.uiContainer.setPosition(screenCenter.x, -screenSize.y);

    this.getScene().tweens.add({
      targets: this.uiContainer,
      ...entryTweenProps,
      y: screenCenter.y
    });
  }

  public async deactivateUI(): Promise<void> {
    if (this.uiContainer) {
      this.uiContainer.setPosition(this.uiContainer.x, this.uiContainer.y);
      this.getSoundManager().playSound(SoundAssets.menuExit.key);

      this.getScene().tweens.add({
        targets: this.uiContainer,
        ...exitTweenProps
      });

      await sleep(exitTweenProps.duration);
      fadeAndDestroy(this.getScene(), this.uiContainer, { fadeDuration: 50 });
    }
  }

  private createUIContainer() {
    const collectibleContainer = new Phaser.GameObjects.Container(this.getScene(), 0, 0);

    const blackUnderlay = new Phaser.GameObjects.Rectangle(
      this.getScene(),
      0,
      0,
      screenSize.x,
      4 * screenSize.y,
      0
    )
      .setAlpha(0.7)
      .setInteractive();

    const collectiblesBg = new Phaser.GameObjects.Image(
      this.getScene(),
      0,
      0,
      ImageAssets.collectiblesMenu.key
    );
    collectibleContainer.add([blackUnderlay, collectiblesBg]);

    // Add options
    const pageOptButtons = Object.keys(CollectiblePage).map((page, index) => {
      return {
        text: page,
        callback: () => this.setPage(page as CollectiblePage)
      };
    });
    const pageOptButtonPositions = this.getPageOptPositions();
    collectibleContainer.add(
      pageOptButtons.map((button, index) =>
        this.createPageOpt(
          button.text,
          pageOptButtonPositions[index][0],
          pageOptButtonPositions[index][1] + collectibleConstants.pageYStartPos,
          button.callback
        )
      )
    );

    // Add back button
    const backButton = this.createPageOpt(
      'Back',
      0,
      collectibleConstants.backButtonYPos,
      async () => {
        if (this.getPhaseManager().isCurrentPhase(GamePhaseType.CollectibleMenu)) {
          await this.getPhaseManager().popPhase();
        }
      }
    );
    collectibleContainer.add(backButton);

    // Add page arrows
    const arrowLeft = createButton(this.getScene(), {
      assetKey: ImageAssets.arrow.key,
      onUp: () => this.nextPage(false)
    })
      .setScale(collectibleConstants.arrowXScale, collectibleConstants.arrowYScale)
      .setRotation((-90 * Math.PI) / 180)
      .setPosition(
        collectibleConstants.arrowXMidPos - collectibleConstants.arrowXOffset,
        collectibleConstants.arrowDownYPos
      );

    const arrowRight = createButton(this.getScene(), {
      assetKey: ImageAssets.arrow.key,
      onUp: () => this.nextPage(true)
    })
      .setScale(collectibleConstants.arrowXScale, collectibleConstants.arrowYScale)
      .setRotation((90 * Math.PI) / 180)
      .setPosition(
        collectibleConstants.arrowXMidPos + collectibleConstants.arrowXOffset,
        collectibleConstants.arrowDownYPos
      );
    collectibleContainer.add([arrowLeft, arrowRight]);

    // Add preview frame
    const frame = new Phaser.GameObjects.Sprite(
      this.getScene(),
      collectibleConstants.previewXPos,
      collectibleConstants.previewYPos,
      ImageAssets.popUpFrame.key
    ).setScale(1.2);
    collectibleContainer.add(frame);

    return collectibleContainer;
  }

  private getPageOptPositions() {
    return calcListFormatPos({
      numOfItems: Object.keys(CollectiblePage).length,
      xSpacing: 0,
      ySpacing: collectibleConstants.pageYSpacing
    });
  }

  private setPreview(title: string, prop: CollectibleProperty, description: string = '') {
    if (this.uiContainer) {
      if (this.previewContainer) this.previewContainer.destroy();
      this.previewContainer = new Phaser.GameObjects.Container(this.getScene(), 0, 0);

      // Preview image
      const previewSprite = new Phaser.GameObjects.Sprite(this.getScene(), 0, 0, prop.assetKey);
      resizeUnderflow(
        previewSprite,
        collectibleConstants.previewDim,
        collectibleConstants.previewDim
      );
      previewSprite
        .setPosition(collectibleConstants.previewXPos, collectibleConstants.previewYPos)
        .setOrigin(0.428, 0.468);

      // Preview title
      const previewTitle = createBitmapText(
        this.getScene(),
        title,
        collectibleConstants.previewXPos,
        collectibleConstants.previewYPos + collectibleConstants.titleYOffset,
        collectibleTitleStyle
      ).setOrigin(0.35, 0.5);

      // Preview description
      const previewDesc = new Phaser.GameObjects.Text(
        this.getScene(),
        collectibleConstants.previewXPos,
        collectibleConstants.previewYPos + collectibleConstants.descYOffset,
        description,
        collectibleDescStyle
      ).setOrigin(0.45, 0.0);

      this.previewContainer.add([previewSprite, previewTitle, previewDesc]);
      this.uiContainer.add(this.previewContainer);
    }
  }

  private nextPage(next: boolean) {
    const currPageNum = this.activePageNumber.get(this.currActivePage)!;
    const newPageNum = limitNumber(
      next ? currPageNum + 1 : currPageNum - 1,
      0,
      Number.MAX_SAFE_INTEGER
    );
    const itemLength = this.getItems(newPageNum).length;

    if (itemLength > 0) {
      this.activePageNumber.set(this.currActivePage, newPageNum);
      this.setPage(this.currActivePage);
    }
  }

  private getScene = () => mandatory(this.scene);
  private getLayerManager = () => mandatory(this.layerManager);
  private getPhaseManager = () => mandatory(this.phaseManager);
  private getSoundManager = () => SourceAcademyGame.getInstance().getSoundManager();
  private getUserStateManager = () => mandatory(this.userStateManager);

  private createPageOpt(text: string, xPos: number, yPos: number, callback: any) {
    return createButton(this.getScene(), {
      assetKey: ImageAssets.collectiblesPage.key,
      message: text,
      textConfig: { x: collectibleConstants.pageTextXPos, y: 0, oriX: 0.1, oriY: 0.5 },
      bitMapTextStyle: pageBannerTextStyle,
      onUp: callback
    }).setPosition(xPos, yPos);
  }

  private createItemsContainer() {
    const itemsContainer = new Phaser.GameObjects.Container(this.getScene(), 0, 0);

    const items = this.getItems(this.activePageNumber.get(this.currActivePage)!);
    const itemPositions = calcListFormatPos({
      numOfItems: items.length,
      xSpacing: 0,
      ySpacing: collectibleConstants.listYSpacing
    });
    itemsContainer.add(
      items.map((item, index) =>
        this.createItemButton(
          item,
          itemPositions[index][0],
          itemPositions[index][1] + collectibleConstants.listYStartPos,
          () => this.setPreview(item, defaultCollectibleProp)
        )
      )
    );
    return itemsContainer;
  }

  private createItemButton(obj: string, xPos: number, yPos: number, callback: any) {
    return createButton(this.getScene(), {
      assetKey: ImageAssets.collectiblesBanner.key,
      message: obj,
      textConfig: { x: collectibleConstants.listTextXPos, y: 0, oriX: 0.0, oriY: 0.55 },
      bitMapTextStyle: listBannerTextStyle,
      onUp: callback
    }).setPosition(xPos, yPos);
  }

  private getItems(pageNum: number) {
    let itemList: string[];
    switch (this.currActivePage) {
      case CollectiblePage.Achievements:
        itemList = this.getUserStateManager().getList(UserStateTypes.achievements);
        break;
      case CollectiblePage.Collectibles:
        itemList = this.getUserStateManager().getList(UserStateTypes.collectibles);
        break;
      default:
        itemList = [];
    }

    const itemStartIdx = pageNum * collectibleConstants.itemsPerPage;
    return itemList.slice(itemStartIdx, itemStartIdx + collectibleConstants.itemsPerPage);
  }
}

export default GameCollectiblesManager;
