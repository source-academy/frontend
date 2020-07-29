import ImageAssets from '../assets/ImageAssets';
import SoundAssets from '../assets/SoundAssets';
import { Constants, screenCenter, screenSize } from '../commons/CommonConstants';
import { IBaseScene, IGameUI } from '../commons/CommonTypes';
import { fadeAndDestroy } from '../effects/FadeEffect';
import { entryTweenProps, exitTweenProps } from '../effects/FlyEffect';
import { Layer } from '../layer/GameLayerTypes';
import { GamePhaseType } from '../phase/GamePhaseTypes';
import SourceAcademyGame from '../SourceAcademyGame';
import { createButton } from '../utils/ButtonUtils';
import { limitNumber, sleep } from '../utils/GameUtils';
import { resizeUnderflow } from '../utils/SpriteUtils';
import { calcListFormatPos } from '../utils/StyleUtils';
import { createBitmapText } from '../utils/TextUtils';
import awardsConstants, {
  awardDescStyle,
  awardKeyStyle,
  awardTitleStyle,
  listBannerTextStyle,
  pageBannerTextStyle
} from './GameAwardsConstants';
import { createAssetKeyPreviewCont, getAwardProps } from './GameAwardsHelper';
import { AwardPage, AwardProperty } from './GameAwardsTypes';

/**
 * Manager for the 'Award Menu'.
 *
 * Here, achievements and collectibles are listed and
 * available for browsing.
 */
class GameAwardsManager implements IGameUI {
  private scene: IBaseScene;

  private uiContainer: Phaser.GameObjects.Container | undefined;
  private previewContainer: Phaser.GameObjects.Container | undefined;
  private itemsContainer: Phaser.GameObjects.Container | undefined;
  private pageChosenContainer: Phaser.GameObjects.Container | undefined;
  private currActivePage: AwardPage;
  private activePageNumber: Map<AwardPage, number>;

  constructor(scene: IBaseScene) {
    this.scene = scene;
    this.activePageNumber = new Map<AwardPage, number>();
    this.currActivePage = AwardPage.Collectibles;
    this.scene.getPhaseManager().addPhaseToMap(GamePhaseType.AwardMenu, this);

    // Set all initial pages number to zero
    Object.keys(AwardPage).forEach((page, index) => {
      const pageName = page as AwardPage;
      this.activePageNumber.set(pageName, 0);
    });
  }

  /**
   * Change the current page in view to a new page.
   *
   * Internally, destroy and replace the containers to reflect
   * the new page; also sets up the blue outline that denotes
   * that the page is chosen.
   *
   * @param page new page
   */
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
        this.scene,
        bannerPos[chosenIdx][0],
        bannerPos[chosenIdx][1] + awardsConstants.pageYStartPos,
        ImageAssets.awardsPageChosen.key
      );
      this.pageChosenContainer = new Phaser.GameObjects.Container(this.scene, 0, 0, [bannerChosen]);
      this.uiContainer.add(this.pageChosenContainer);

      // Set default preview
      this.setPreview();
    }
  }

  /**
   * Create the container that encapsulate the 'Award Menu' UI.
   */
  private createUIContainer() {
    const awardContainer = new Phaser.GameObjects.Container(this.scene, 0, 0);

    const blackUnderlay = new Phaser.GameObjects.Rectangle(
      this.scene,
      0,
      0,
      screenSize.x,
      4 * screenSize.y,
      0
    )
      .setAlpha(0.7)
      .setInteractive();

    const awardBg = new Phaser.GameObjects.Image(this.scene, 0, 0, ImageAssets.awardsMenu.key);
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
      if (this.scene.getPhaseManager().isCurrentPhase(GamePhaseType.AwardMenu)) {
        await this.scene.getPhaseManager().popPhase();
      }
    });
    awardContainer.add(backButton);

    // Add page arrows
    const arrowLeft = createButton(this.scene, {
      assetKey: ImageAssets.arrow.key,
      onUp: () => this.nextPage(false)
    })
      .setScale(awardsConstants.arrowXScale, awardsConstants.arrowYScale)
      .setRotation((-90 * Math.PI) / 180)
      .setPosition(
        awardsConstants.arrowXMidPos - awardsConstants.arrowXOffset,
        awardsConstants.arrowDownYPos
      );

    const arrowRight = createButton(this.scene, {
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
      this.scene,
      awardsConstants.previewXPos,
      awardsConstants.previewYPos,
      ImageAssets.popUpFrame.key
    ).setScale(1.2);
    awardContainer.add(frame);

    return awardContainer;
  }

  /**
   * Get positions of the page options.
   */
  private getPageOptPositions() {
    return calcListFormatPos({
      numOfItems: Object.keys(AwardPage).length,
      xSpacing: 0,
      ySpacing: awardsConstants.pageYSpacing
    });
  }

  /**
   * Set the preview of the award; shown on the left side of the menu.
   *
   * The preview include the title of achievement, object asset, asset key,
   * as well as asset description.
   *
   * @param award award to preview
   */
  private setPreview(award?: AwardProperty) {
    if (this.uiContainer) {
      if (this.previewContainer) this.previewContainer.destroy();
      this.previewContainer = new Phaser.GameObjects.Container(
        this.scene,
        awardsConstants.previewXOffset,
        awardsConstants.previewYOffset
      );

      if (award) {
        // Preview title
        const previewTitle = createBitmapText(
          this.scene,
          award.title,
          awardsConstants.previewTitleTextConfig,
          awardTitleStyle
        );

        // Preview asset key
        const previewKey = createAssetKeyPreviewCont(this.scene, award.assetKey);

        // Preview description
        const previewDesc = new Phaser.GameObjects.Text(
          this.scene,
          awardsConstants.previewXPos,
          awardsConstants.previewYPos + awardsConstants.previewDescTextYOffset,
          award.description,
          awardDescStyle
        ).setOrigin(0.5, 0.0);

        // Preview image
        let previewAsset;
        if (award.assetKey === Constants.nullInteractionId) {
          // No asset is associated with the award
          previewAsset = createBitmapText(
            this.scene,
            'No preview available',
            awardsConstants.noPreviewTextConfig,
            awardKeyStyle
          );
        } else {
          previewAsset = new Phaser.GameObjects.Sprite(this.scene, 0, 0, award.assetKey);
          resizeUnderflow(previewAsset, awardsConstants.previewDim, awardsConstants.previewDim);
          previewAsset.setPosition(awardsConstants.previewXPos, awardsConstants.previewYPos);
        }

        // Black tint to overlay the asset if award is not completed
        const blackTint = new Phaser.GameObjects.Rectangle(
          this.scene,
          awardsConstants.previewXPos,
          awardsConstants.previewYPos,
          awardsConstants.previewDim,
          awardsConstants.previewDim,
          0
        ).setAlpha(award.completed === false ? 0.8 : 0);

        this.previewContainer.add([previewAsset, blackTint, previewTitle, previewDesc, previewKey]);
      }

      this.uiContainer.add(this.previewContainer);
    }
  }

  /**
   * Flip the page.
   *
   * The minimum page number is 0, which represent the
   * start of the list.
   *
   * This method is only able to flip forward (increment the page number)
   * if there is still items to be shown on the list after what is
   * shown currently.
   *
   * @param next if next is set to true, page number will be incremented
   *             by one; else it will be decremented by one.
   */
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

  /**
   * Format the button information to a UI container, complete with
   * styling and functionality. This button represent the page option button,
   * whether it is 'collectible' or 'achievement'.
   *
   * @param text text to be displayed on the button
   * @param xPos x position of the button
   * @param yPos y position of the button
   * @param callback callback to be executed on click
   */
  private createPageOpt(text: string, xPos: number, yPos: number, callback: any) {
    return createButton(this.scene, {
      assetKey: ImageAssets.awardsPage.key,
      message: text,
      textConfig: { x: awardsConstants.pageTextXPos, y: 0, oriX: 0.1, oriY: 0.5 },
      bitMapTextStyle: pageBannerTextStyle,
      onUp: callback
    }).setPosition(xPos, yPos);
  }

  /**
   * Create a container that represent the list of objects
   * to be selected on the screen.
   */
  private createItemsContainer() {
    const itemsContainer = new Phaser.GameObjects.Container(this.scene, 0, 0);

    // Use the previously active page number of the page
    const items = this.getItems(this.activePageNumber.get(this.currActivePage)!);
    const itemPositions = calcListFormatPos({
      numOfItems: items.length,
      xSpacing: 0,
      ySpacing: awardsConstants.listYSpacing
    });

    // Populate container with all the item buttons
    itemsContainer.add(
      items.map((awardProp, index) => {
        const button = this.createItemButton(
          awardProp.title,
          itemPositions[index][0],
          itemPositions[index][1] + awardsConstants.listYStartPos,
          () => this.setPreview(awardProp)
        );

        // For non completed awards, make it less visible
        if (awardProp.completed === false) button.setAlpha(0.5);

        return button;
      })
    );
    return itemsContainer;
  }

  /**
   * Format the button information to a UI container, complete with
   * styling and functionality. This button represent the object selection
   * button.
   *
   * @param obj name of object to be displayed on the button
   * @param xPos x position of the button
   * @param yPos y position of the button
   * @param callback callback to be executed on click
   */
  private createItemButton(obj: string, xPos: number, yPos: number, callback: any) {
    return createButton(this.scene, {
      assetKey: ImageAssets.awardsBanner.key,
      message: obj,
      textConfig: { x: awardsConstants.listTextXPos, y: 0, oriX: 0.0, oriY: 0.55 },
      bitMapTextStyle: listBannerTextStyle,
      onUp: callback
    }).setPosition(xPos, yPos);
  }

  /**
   * Get the list of objects to be shown on the UI.
   *
   * List items is dependent on the active page;
   * and is only limited to a number of items due to UI
   * size. Hence, which section of list is taken is
   * dependent on the parameter pageNum.
   *
   * @param pageNum page number
   */
  private getItems(pageNum: number) {
    let keys: string[];
    switch (this.currActivePage) {
      case AwardPage.Achievements:
        keys = this.getUserStateManager().getAchievements();
        break;
      case AwardPage.Collectibles:
        keys = this.getUserStateManager().getCollectibles();
        break;
      default:
        keys = [];
    }

    const itemList = getAwardProps(keys);
    const itemStartIdx = pageNum * awardsConstants.itemsPerPage;
    return itemList.slice(itemStartIdx, itemStartIdx + awardsConstants.itemsPerPage);
  }

  /**
   * Activate the 'Award Menu' UI.
   *
   * Usually only called by the phase manager when 'Award' phase is
   * pushed.
   */
  public async activateUI(): Promise<void> {
    this.uiContainer = this.createUIContainer();
    this.scene.getLayerManager().addToLayer(Layer.UI, this.uiContainer);
    this.getSoundManager().playSound(SoundAssets.menuEnter.key);

    // Set initial page
    this.setPage(this.currActivePage);

    this.uiContainer.setPosition(screenCenter.x, -screenSize.y);

    this.scene.tweens.add({
      targets: this.uiContainer,
      ...entryTweenProps,
      y: screenCenter.y
    });
  }

  /**
   * Deactivate the 'Award Menu' UI.
   *
   * Usually only called by the phase manager when 'Award' phase is
   * transitioned out.
   */
  public async deactivateUI(): Promise<void> {
    if (this.uiContainer) {
      this.uiContainer.setPosition(this.uiContainer.x, this.uiContainer.y);
      this.getSoundManager().playSound(SoundAssets.menuExit.key);

      this.scene.tweens.add({
        targets: this.uiContainer,
        ...exitTweenProps
      });

      await sleep(exitTweenProps.duration);
      fadeAndDestroy(this.scene, this.uiContainer, { fadeDuration: 50 });
    }
  }

  private getSoundManager = () => SourceAcademyGame.getInstance().getSoundManager();
  private getUserStateManager = () => SourceAcademyGame.getInstance().getUserStateManager();
}

export default GameAwardsManager;
