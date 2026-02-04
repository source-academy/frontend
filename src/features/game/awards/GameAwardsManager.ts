import ImageAssets from '../assets/ImageAssets';
import { Constants } from '../commons/CommonConstants';
import { IBaseScene } from '../commons/CommonTypes';
import { DashboardPageManager } from '../dashboard/GameDashboardTypes';
import { createButton } from '../utils/ButtonUtils';
import { limitNumber } from '../utils/GameUtils';
import { resizeUnderflow } from '../utils/SpriteUtils';
import { calcListFormatPos } from '../utils/StyleUtils';
import { createBitmapText } from '../utils/TextUtils';
import AwardsConstants, {
  awardDescStyle,
  awardKeyStyle,
  awardTitleStyle,
  listBannerTextStyle
} from './GameAwardsConstants';
import { createAssetKeyPreviewCont, getAwardProps } from './GameAwardsHelper';
import { AwardProperty } from './GameAwardsTypes';

/**
 * Manager for an award page on the dashboard (either collectibles or achievements).
 */
class GameAwardsManager implements DashboardPageManager {
  private scene: IBaseScene;
  private awardsGetter: () => string[]; // The function for retrieving the award keys

  private uiContainer: Phaser.GameObjects.Container | undefined;
  private previewContainer: Phaser.GameObjects.Container | undefined;
  private itemsContainer: Phaser.GameObjects.Container | undefined;
  private activePageNumber: number;

  constructor(scene: IBaseScene, awardsGetter: () => string[]) {
    this.scene = scene;
    this.awardsGetter = awardsGetter;
    this.activePageNumber = 0;
  }

  /**
   * Create the container that encapsulate the 'Award Menu' UI.
   */
  public createUIContainer() {
    const awardContainer = new Phaser.GameObjects.Container(this.scene, 0, 0);
    this.uiContainer = awardContainer;

    // Add page arrows
    const arrowLeft = createButton(this.scene, {
      assetKey: ImageAssets.arrow.key,
      onUp: () => this.nextPage(false)
    })
      .setScale(AwardsConstants.arrow.yScale, AwardsConstants.arrow.yScale)
      .setRotation((-90 * Math.PI) / 180)
      .setPosition(
        AwardsConstants.arrow.x - AwardsConstants.arrow.xOffset,
        AwardsConstants.arrow.y
      );

    const arrowRight = createButton(this.scene, {
      assetKey: ImageAssets.arrow.key,
      onUp: () => this.nextPage(true)
    })
      .setScale(AwardsConstants.arrow.xScale, AwardsConstants.arrow.yScale)
      .setRotation((90 * Math.PI) / 180)
      .setPosition(
        AwardsConstants.arrow.x + AwardsConstants.arrow.xOffset,
        AwardsConstants.arrow.y
      );
    awardContainer.add([arrowLeft, arrowRight]);

    // Add preview frame
    const frame = new Phaser.GameObjects.Sprite(
      this.scene,
      AwardsConstants.preview.rect.x,
      AwardsConstants.preview.rect.y,
      ImageAssets.popUpFrame.key
    ).setScale(1.2);
    awardContainer.add(frame);

    // Add asset key container
    awardContainer.add(createAssetKeyPreviewCont(this.scene));

    // Set initial page
    this.setPage();

    return awardContainer;
  }

  /**
   * Change the current page in view to a new page.
   *
   * Internally, destroy and replace the containers to reflect
   * the new page.
   */
  private setPage() {
    if (this.uiContainer) {
      if (this.itemsContainer) this.itemsContainer.destroy();

      // Update
      this.itemsContainer = this.createItemsContainer();
      this.uiContainer.add(this.itemsContainer);

      // Set default preview
      this.setPreview();
    }
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
      if (!award) return;

      this.previewContainer = new Phaser.GameObjects.Container(
        this.scene,
        AwardsConstants.preview.rect.xOffset,
        AwardsConstants.preview.rect.yOffset
      );

      // Preview image
      let previewAsset;
      if (award.assetKey === Constants.nullInteractionId) {
        // No asset is associated with the award
        previewAsset = createBitmapText(
          this.scene,
          'No preview available',
          AwardsConstants.noPreviewTextConfig,
          awardKeyStyle
        );
      } else {
        const previewRect = AwardsConstants.preview.rect;
        previewAsset = new Phaser.GameObjects.Sprite(this.scene, 0, 0, award.assetKey);
        resizeUnderflow(previewAsset, previewRect.dim, previewRect.dim);
        previewAsset.setPosition(previewRect.x, previewRect.y);
      }

      // Preview title
      const previewTitle = createBitmapText(
        this.scene,
        award.title,
        AwardsConstants.preview.titleTextConfig,
        awardTitleStyle
      );

      // Preview description
      const previewDesc = new Phaser.GameObjects.Text(
        this.scene,
        AwardsConstants.preview.rect.x,
        AwardsConstants.preview.rect.y + AwardsConstants.preview.descText.yOffset,
        award.description,
        awardDescStyle
      ).setOrigin(0.5, 0.0);

      // Preview asset key, use only empty string if award is not completed
      const assetKey = award.completed === false ? '' : award.assetKey;
      const previewKey = createBitmapText(
        this.scene,
        assetKey,
        AwardsConstants.preview.keyTextConfig,
        awardKeyStyle
      );

      // Black tint to overlay the asset if award is not completed
      const blackTint = new Phaser.GameObjects.Rectangle(
        this.scene,
        AwardsConstants.preview.rect.x,
        AwardsConstants.preview.rect.y,
        AwardsConstants.preview.rect.dim,
        AwardsConstants.preview.rect.dim,
        0
      ).setAlpha(award.completed ? 0 : 0.8);

      this.previewContainer.add([previewAsset, blackTint, previewTitle, previewDesc, previewKey]);
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
    const currPageNum = this.activePageNumber;
    const newPageNum = limitNumber(
      next ? currPageNum + 1 : currPageNum - 1,
      0,
      Number.MAX_SAFE_INTEGER
    );
    const itemLength = this.getItems(newPageNum).length;

    if (itemLength > 0) {
      this.activePageNumber = newPageNum;
      this.setPage();
    }
  }

  /**
   * Create a container that represent the list of objects
   * to be selected on the screen.
   */
  private createItemsContainer() {
    const itemsContainer = new Phaser.GameObjects.Container(this.scene, 0, 0);

    // Use the previously active page number of the page
    const items = this.getItems(this.activePageNumber);
    const itemPositions = calcListFormatPos({
      numOfItems: items.length,
      xSpacing: 0,
      ySpacing: AwardsConstants.list.ySpace
    });

    // Populate container with all the item buttons
    itemsContainer.add(
      items.map((awardProp, index) =>
        this.createItemButton(
          awardProp.title,
          itemPositions[index][0],
          itemPositions[index][1] + AwardsConstants.list.yStart,
          () => this.setPreview(awardProp),
          awardProp.completed !== false
        )
      )
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
  private createItemButton(
    obj: string,
    xPos: number,
    yPos: number,
    callback: any,
    completed: boolean
  ) {
    const button = createButton(this.scene, {
      assetKey: ImageAssets.awardsBanner.key,
      message: obj,
      textConfig: AwardsConstants.listTextConfig,
      bitMapTextStyle: listBannerTextStyle,
      onUp: callback,
      onHoverEffect: completed
    }).setPosition(xPos, yPos);

    // For non completed award, they do not hover effect and is less visible
    if (!completed) button.setAlpha(0.5);
    return button;
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
    const keys = this.awardsGetter();
    const itemList = getAwardProps(keys);
    const itemStartIdx = pageNum * AwardsConstants.itemsPerPage;
    return itemList.slice(itemStartIdx, itemStartIdx + AwardsConstants.itemsPerPage);
  }
}

export default GameAwardsManager;
