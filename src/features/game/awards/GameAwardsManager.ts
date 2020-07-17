import SourceAcademyGame from 'src/pages/academy/game/subcomponents/sourceAcademyGame';

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
import awardsConstants, {
  awardDescStyle,
  awardTitleStyle,
  defaultAwardProp,
  listBannerTextStyle,
  pageBannerTextStyle
} from './GameAwardsConstants';
import { AwardPage, AwardProperty } from './GameAwardsTypes';

/**
 * Manager for rendering collectibles and achievements popup in the location.
 */
class GameAwardsManager implements IGameUI {
  private scene: Phaser.Scene | undefined;
  private layerManager: GameLayerManager | undefined;
  private userStateManager: GameUserStateManager | undefined;
  private phaseManager: GamePhaseManager | undefined;
  private uiContainer: Phaser.GameObjects.Container | undefined;
  private previewContainer: Phaser.GameObjects.Container | undefined;
  private itemsContainer: Phaser.GameObjects.Container | undefined;
  private pageChosenContainer: Phaser.GameObjects.Container | undefined;
  private currActivePage: AwardPage;
  private activePageNumber: Map<AwardPage, number>;

  constructor() {
    this.activePageNumber = new Map<AwardPage, number>();
    this.currActivePage = AwardPage.Collectibles;
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
    Object.keys(AwardPage).forEach((page, index) => {
      const pageName = page as AwardPage;
      this.activePageNumber.set(pageName, 0);
    });
  }

  private setPage(page: AwardPage) {
    if (this.uiContainer) {
      if (this.itemsContainer) this.itemsContainer.destroy();
      if (this.pageChosenContainer) this.pageChosenContainer.destroy();

      // Update
      this.currActivePage = page;
      this.itemsContainer = this.createItemsContainer();
      this.uiContainer.add(this.itemsContainer);

      // Set chosen page banner
      const bannerPos = this.getPageOptPositions();
      const chosenIdx = Object.keys(AwardPage).findIndex(pg => pg === (page as string));
      const bannerChosen = new Phaser.GameObjects.Sprite(
        this.getScene(),
        bannerPos[chosenIdx][0],
        bannerPos[chosenIdx][1] + awardsConstants.pageYStartPos,
        ImageAssets.awardsPageChosen.key
      );
      this.pageChosenContainer = new Phaser.GameObjects.Container(this.getScene(), 0, 0, [
        bannerChosen
      ]);
      this.uiContainer.add(this.pageChosenContainer);

      // Set default preview
      this.setPreview(defaultAwardProp);
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
    const awardContainer = new Phaser.GameObjects.Container(this.getScene(), 0, 0);

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

    const awardBg = new Phaser.GameObjects.Image(this.getScene(), 0, 0, ImageAssets.awardsMenu.key);
    awardContainer.add([blackUnderlay, awardBg]);

    // Add options
    const pageOptButtons = Object.keys(AwardPage).map((page, index) => {
      return {
        text: page,
        callback: () => this.setPage(page as AwardPage)
      };
    });
    const pageOptButtonPositions = this.getPageOptPositions();
    awardContainer.add(
      pageOptButtons.map((button, index) =>
        this.createPageOpt(
          button.text,
          pageOptButtonPositions[index][0],
          pageOptButtonPositions[index][1] + awardsConstants.pageYStartPos,
          button.callback
        )
      )
    );

    // Add back button
    const backButton = this.createPageOpt('Back', 0, awardsConstants.backButtonYPos, async () => {
      if (this.getPhaseManager().isCurrentPhase(GamePhaseType.AwardMenu)) {
        await this.getPhaseManager().popPhase();
      }
    });
    awardContainer.add(backButton);

    // Add page arrows
    const arrowLeft = createButton(this.getScene(), {
      assetKey: ImageAssets.arrow.key,
      onUp: () => this.nextPage(false)
    })
      .setScale(awardsConstants.arrowXScale, awardsConstants.arrowYScale)
      .setRotation((-90 * Math.PI) / 180)
      .setPosition(
        awardsConstants.arrowXMidPos - awardsConstants.arrowXOffset,
        awardsConstants.arrowDownYPos
      );

    const arrowRight = createButton(this.getScene(), {
      assetKey: ImageAssets.arrow.key,
      onUp: () => this.nextPage(true)
    })
      .setScale(awardsConstants.arrowXScale, awardsConstants.arrowYScale)
      .setRotation((90 * Math.PI) / 180)
      .setPosition(
        awardsConstants.arrowXMidPos + awardsConstants.arrowXOffset,
        awardsConstants.arrowDownYPos
      );
    awardContainer.add([arrowLeft, arrowRight]);

    // Add preview frame
    const frame = new Phaser.GameObjects.Sprite(
      this.getScene(),
      awardsConstants.previewXPos,
      awardsConstants.previewYPos,
      ImageAssets.popUpFrame.key
    ).setScale(1.2);
    awardContainer.add(frame);

    return awardContainer;
  }

  private getPageOptPositions() {
    return calcListFormatPos({
      numOfItems: Object.keys(AwardPage).length,
      xSpacing: 0,
      ySpacing: awardsConstants.pageYSpacing
    });
  }

  private setPreview(award: AwardProperty) {
    if (this.uiContainer) {
      if (this.previewContainer) this.previewContainer.destroy();
      this.previewContainer = new Phaser.GameObjects.Container(this.getScene(), 0, 0);

      // Preview image
      const previewSprite = new Phaser.GameObjects.Sprite(this.getScene(), 0, 0, award.assetKey);
      resizeUnderflow(previewSprite, awardsConstants.previewDim, awardsConstants.previewDim);
      previewSprite
        .setPosition(awardsConstants.previewXPos, awardsConstants.previewYPos)
        .setOrigin(0.428, 0.468);

      // Preview title
      const previewTitle = createBitmapText(
        this.getScene(),
        award.title,
        awardsConstants.previewXPos,
        awardsConstants.previewYPos + awardsConstants.titleYOffset,
        awardTitleStyle
      ).setOrigin(0.35, 0.5);

      // Preview description
      const previewDesc = new Phaser.GameObjects.Text(
        this.getScene(),
        awardsConstants.previewXPos,
        awardsConstants.previewYPos + awardsConstants.descYOffset,
        award.description,
        awardDescStyle
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
      assetKey: ImageAssets.awardsPage.key,
      message: text,
      textConfig: { x: awardsConstants.pageTextXPos, y: 0, oriX: 0.1, oriY: 0.5 },
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
      ySpacing: awardsConstants.listYSpacing
    });
    itemsContainer.add(
      items.map((item, index) =>
        this.createItemButton(
          item,
          itemPositions[index][0],
          itemPositions[index][1] + awardsConstants.listYStartPos,
          () => this.setPreview(defaultAwardProp)
        )
      )
    );
    return itemsContainer;
  }

  private createItemButton(obj: string, xPos: number, yPos: number, callback: any) {
    return createButton(this.getScene(), {
      assetKey: ImageAssets.awardsBanner.key,
      message: obj,
      textConfig: { x: awardsConstants.listTextXPos, y: 0, oriX: 0.0, oriY: 0.55 },
      bitMapTextStyle: listBannerTextStyle,
      onUp: callback
    }).setPosition(xPos, yPos);
  }

  private getItems(pageNum: number) {
    let itemList: string[];
    switch (this.currActivePage) {
      case AwardPage.Achievements:
        itemList = this.getUserStateManager().getList(UserStateTypes.achievements);
        break;
      case AwardPage.Collectibles:
        itemList = this.getUserStateManager().getList(UserStateTypes.collectibles);
        break;
      default:
        itemList = [];
    }

    const itemStartIdx = pageNum * awardsConstants.itemsPerPage;
    return itemList.slice(itemStartIdx, itemStartIdx + awardsConstants.itemsPerPage);
  }
}

export default GameAwardsManager;
