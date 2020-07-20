import { screenCenter, screenSize } from 'src/features/game/commons/CommonConstants';
import { limitNumber, sleep, toS3Path } from 'src/features/game/utils/GameUtils';

import ImageAssets from '../../assets/ImageAssets';
import CommonBackButton from '../../commons/CommonBackButton';
import { addLoadingScreen } from '../../effects/LoadingScreen';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import { FullSaveState } from '../../save/GameSaveTypes';
import SourceAcademyGame from '../../SourceAcademyGame';
import { createButton } from '../../utils/ButtonUtils';
import { loadImage } from '../../utils/LoaderUtils';
import chapConstants from './ChapterSelectConstants';
import { createChapter } from './ChapterSelectHelper';

/**
 * The Chapter Select scene.
 * Player is able to choose which chapter to play from here.
 */
class ChapterSelect extends Phaser.Scene {
  public layerManager: GameLayerManager;

  private chapterContainer: Phaser.GameObjects.Container | undefined;
  private backButtonContainer: Phaser.GameObjects.Container | undefined;
  private loadedGameState: FullSaveState | undefined;
  private autoScrolling: boolean;
  private isScrollLeft: boolean;
  private isScrollRight: boolean;

  constructor() {
    super('ChapterSelect');

    this.chapterContainer = undefined;
    this.backButtonContainer = undefined;
    this.layerManager = new GameLayerManager();
    this.autoScrolling = true;
    this.isScrollLeft = false;
    this.isScrollRight = false;
  }

  public init() {
    SourceAcademyGame.getInstance().setCurrentSceneRef(this);
  }

  public preload() {
    addLoadingScreen(this);
    this.layerManager.initialise(this);
  }

  public async create() {
    await SourceAcademyGame.getInstance().loadGameChapters();
    await this.preloadChapterAssets();
    this.renderBackground();
    this.renderChapters();
    this.autoScroll();
  }

  public update() {
    if (!this.chapterContainer || this.autoScrolling) return;

    let newXPos = this.chapterContainer.x;
    if (this.isScrollRight) {
      newXPos -= chapConstants.defaultScrollSpeed;
    } else if (this.isScrollLeft) {
      newXPos += chapConstants.defaultScrollSpeed;
    }
    this.chapterContainer.x = limitNumber(
      newXPos,
      -chapConstants.imageDist * (this.getGameChapters().length - 1),
      0
    );
  }

  public cleanUp() {
    this.layerManager.clearAllLayers();
  }

  private async preloadChapterAssets() {
    await Promise.all(
      this.getGameChapters().map(
        async chapterDetail =>
          await loadImage(this, chapterDetail.imageUrl, toS3Path(chapterDetail.imageUrl))
      )
    );
  }

  private renderBackground() {
    const background = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      ImageAssets.chapterSelectBackground.key
    );
    const blackOverlay = new Phaser.GameObjects.Rectangle(
      this,
      screenCenter.x,
      screenCenter.y,
      screenSize.x,
      screenSize.y,
      0
    ).setAlpha(0.3);
    this.layerManager.addToLayer(Layer.Background, background);
    this.layerManager.addToLayer(Layer.Background, blackOverlay);
  }

  private renderChapters() {
    const mask = this.createMask();
    this.backButtonContainer = new CommonBackButton(this, () => {
      this.cleanUp();
      this.scene.start('MainMenu');
    });
    this.chapterContainer = this.createChapterContainer();
    this.chapterContainer.mask = new Phaser.Display.Masks.GeometryMask(this, mask);

    const border = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      ImageAssets.chapterSelectBorder.key
    );

    const leftArrow = createButton(this, {
      assetKey: ImageAssets.chapterSelectArrow.key,
      onDown: () => (this.isScrollLeft = true),
      onUp: () => (this.isScrollLeft = false),
      onOut: () => (this.isScrollLeft = false)
    }).setPosition(screenCenter.x - chapConstants.arrowXOffset, screenCenter.y);

    const rightArrow = createButton(this, {
      assetKey: ImageAssets.chapterSelectArrow.key,
      onDown: () => (this.isScrollRight = true),
      onUp: () => (this.isScrollRight = false),
      onOut: () => (this.isScrollRight = false)
    })
      .setPosition(screenCenter.x + chapConstants.arrowXOffset, screenCenter.y)
      .setScale(-1, 1);

    this.layerManager.addToLayer(Layer.UI, this.chapterContainer);
    this.layerManager.addToLayer(Layer.UI, this.backButtonContainer);
    this.layerManager.addToLayer(Layer.UI, border);
    this.layerManager.addToLayer(Layer.UI, leftArrow);
    this.layerManager.addToLayer(Layer.UI, rightArrow);
  }

  private createMask() {
    const graphics = this.add.graphics();
    const mask = graphics
      .fillRect(
        chapConstants.maskRect.x,
        chapConstants.maskRect.y,
        chapConstants.maskRect.width,
        chapConstants.maskRect.height
      )
      .setPosition(screenCenter.x, screenCenter.y);
    mask.alpha = 0;
    return mask;
  }

  private createChapterContainer() {
    const chapterContainer = new Phaser.GameObjects.Container(this, 0, 0);
    chapterContainer.add(
      this.getGameChapters().map((chapterDetail, chapterIndex) => {
        // Use latest checkpoint if it exist
        let lastCheckpoint = 0;
        if (this.loadedGameState && this.loadedGameState.gameSaveStates[chapterIndex]) {
          lastCheckpoint = this.loadedGameState.gameSaveStates[chapterIndex].lastCheckpointPlayed;
        }
        return createChapter(this, chapterDetail, chapterIndex, lastCheckpoint);
      })
    );
    return chapterContainer;
  }

  private async autoScroll() {
    const chapterIdx = Math.min(
      SourceAcademyGame.getInstance().getSaveManager().getLargestCompletedChapter() + 1,
      this.getGameChapters().length - 1
    );

    await this.scrollToIndex(chapterIdx);
    this.autoScrolling = false;
  }

  public getGameChapters = () => SourceAcademyGame.getInstance().getGameChapters();

  private async scrollToIndex(id: number) {
    if (!this.chapterContainer) return;
    const xTarget = -id * chapConstants.imageDist;

    const scrollDuration = 800;
    this.tweens.add({
      targets: this.chapterContainer,
      x: xTarget,
      ease: 'Power2',
      duration: scrollDuration
    });
    await sleep(scrollDuration);
  }
}

export default ChapterSelect;
