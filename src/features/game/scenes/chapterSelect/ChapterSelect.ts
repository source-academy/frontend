import { screenCenter, screenSize } from 'src/features/game/commons/CommonConstants';
import { mandatory, toS3Path } from 'src/features/game/utils/GameUtils';

import ImageAssets from '../../assets/ImageAssets';
import CommonBackButton from '../../commons/CommonBackButton';
import { addLoadingScreen } from '../../effects/LoadingScreen';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import SourceAcademyGame from '../../SourceAcademyGame';
import { createButton } from '../../utils/ButtonUtils';
import { loadImage } from '../../utils/LoaderUtils';
import { createBitmapText } from '../../utils/TextUtils';
import chapConstants, { pageNumberStyle } from './ChapterSelectConstants';
import { createChapter } from './ChapterSelectHelper';

/**
 * The Chapter Select scene.
 * Player is able to choose which chapter to play from here.
 */
class ChapterSelect extends Phaser.Scene {
  public layerManager?: GameLayerManager;

  private chaptersContainer: Phaser.GameObjects.Container | undefined;
  private backButtonContainer: Phaser.GameObjects.Container | undefined;
  private pageNumberText: Phaser.GameObjects.BitmapText | undefined;
  private targetPage: number;

  constructor() {
    super('ChapterSelect');

    this.chaptersContainer = undefined;
    this.backButtonContainer = undefined;
    this.pageNumberText = undefined;
    this.targetPage = 0; // First page is page 0 (but is displayed as page 1)
  }

  public preload() {
    addLoadingScreen(this);
  }

  public async create() {
    SourceAcademyGame.getInstance().setCurrentSceneRef(this);
    this.layerManager = new GameLayerManager(this);
    await this.preloadChapterAssets();
    this.renderBackground();
    this.renderChapters();
  }

  public update() {
    if (!this.chaptersContainer) return;

    const targetX = -this.targetPage * screenSize.x;
    if (this.chaptersContainer.x > targetX) {
      // Scroll right
      const newXPos = this.chaptersContainer.x - chapConstants.scrollSpeed;
      this.chaptersContainer.x = Math.max(newXPos, targetX);
    } else if (targetX > this.chaptersContainer.x) {
      // Scroll left
      const newXPos = this.chaptersContainer.x + chapConstants.scrollSpeed;
      this.chaptersContainer.x = Math.min(newXPos, targetX);
    }
  }

  /**
   * Clean up of related managers.
   */
  public cleanUp() {
    this.getLayerManager().clearAllLayers();
  }

  /**
   * Load the chapter previews assets to be shown.
   */
  private async preloadChapterAssets() {
    await Promise.all(
      this.getGameChapters().map(
        async chapterDetail =>
          await loadImage(this, chapterDetail.imageUrl, toS3Path(chapterDetail.imageUrl, true))
      )
    );
  }

  /**
   * Render the background of this scene.
   */
  private renderBackground() {
    const background = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      ImageAssets.spaceshipBg.key
    );
    const blackOverlay = new Phaser.GameObjects.Rectangle(
      this,
      screenCenter.x,
      screenCenter.y,
      screenSize.x,
      screenSize.y,
      0
    ).setAlpha(0.3);
    this.getLayerManager().addToLayer(Layer.Background, background);
    this.getLayerManager().addToLayer(Layer.Background, blackOverlay);
  }

  /**
   * Render all the chapter selections and UI elements
   * (the gray frame, the left and right arrow, back button, page number)
   */
  private renderChapters() {
    this.backButtonContainer = new CommonBackButton(this, () => {
      this.cleanUp();
      this.scene.start('MainMenu');
    });
    this.chaptersContainer = this.createChaptersContainer();

    this.pageNumberText = createBitmapText(
      this,
      `1 / ${this.numPages()}`,
      chapConstants.pageNumberTextConfig,
      pageNumberStyle
    );

    // Prepare to autoscroll to smallest incomplete chapter
    const latestChapter = Math.min(
      SourceAcademyGame.getInstance().getSaveManager().getLargestCompletedChapterNum() + 1,
      this.getGameChapters().length - 1
    );
    this.targetPage = Math.floor(latestChapter / chapConstants.grid.chapPerPage);
    if (this.targetPage < 0) {
      // Only happens when this.getGameChapters().length === 0
      this.targetPage = 0;
    }
    this.pageNumberText.setText(`${this.targetPage + 1} / ${this.numPages()}`);

    const border = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      ImageAssets.chapterSelectBorder.key
    );

    const leftArrow = createButton(this, {
      assetKey: ImageAssets.chapterSelectArrow.key,
      onUp: () => this.scrollPrevPage()
    }).setPosition(screenCenter.x - chapConstants.arrow.xOffset, screenCenter.y);

    const rightArrow = createButton(this, {
      assetKey: ImageAssets.chapterSelectArrow.key,
      onUp: () => this.scrollNextPage()
    })
      .setPosition(screenCenter.x + chapConstants.arrow.xOffset, screenCenter.y)
      .setScale(-1, 1);

    this.getLayerManager().addToLayer(Layer.UI, this.chaptersContainer);
    this.getLayerManager().addToLayer(Layer.UI, this.backButtonContainer);
    this.getLayerManager().addToLayer(Layer.UI, this.pageNumberText);
    this.getLayerManager().addToLayer(Layer.UI, border);
    this.getLayerManager().addToLayer(Layer.UI, leftArrow);
    this.getLayerManager().addToLayer(Layer.UI, rightArrow);
  }

  /**
   * Create a chapter selection based on its detail; as well as
   * attach it with the necessary information (user progress).
   *
   * The information will be used/mutated depending on whether
   * the user decides to continue or reset the progress.
   */
  private createChaptersContainer() {
    const chaptersContainer = new Phaser.GameObjects.Container(this, 0, 0);
    chaptersContainer
      .add(
        this.getGameChapters().map((chapterDetail, chapterIndex) => {
          return createChapter(this, chapterDetail, chapterIndex);
        })
      )
      .sort('depth')
      .reverse(); // Ensures hover text correctly render over other objects in container
    return chaptersContainer;
  }

  private getGameChapters = () => SourceAcademyGame.getInstance().getGameChapters();

  /**
   * Returns the number of pages of chapters
   */
  private numPages() {
    const pages = Math.ceil(this.getGameChapters().length / chapConstants.grid.chapPerPage);
    return Math.max(pages, 1); // Always have at least 1 page, even when 0 chapters
  }

  /**
   * Scroll the screen to the previous page of chapters
   */
  private scrollPrevPage() {
    this.targetPage = Math.max(this.targetPage - 1, 0);
    this.pageNumberText?.setText(`${this.targetPage + 1} / ${this.numPages()}`);
  }

  /**
   * Scroll the screen to the next page of chapters
   */
  private scrollNextPage() {
    const numPages = this.numPages();
    this.targetPage = Math.min(this.targetPage + 1, numPages - 1);
    this.pageNumberText?.setText(`${this.targetPage + 1} / ${numPages}`);
  }

  public getLayerManager = () => mandatory(this.layerManager);
}

export default ChapterSelect;
