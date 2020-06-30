import { screenCenter } from 'src/features/game/commons/CommonConstants';
import { limitNumber, sleep } from 'src/features/game/utils/GameUtils';
import { addLoadingScreen } from '../../effects/LoadingScreen';
import { SampleChapters } from './SampleChapters';
import { chapterSelectAssets, chapterSelectBackground } from './ChapterSelectAssets';
import {
  defaultScrollSpeed,
  maskRect,
  imageDist,
  scrollSpeedLimit,
  imageRect
} from './ChapterSelectConstants';
import { createChapter } from './ChapterSelectHelper';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import CommonBackButton from '../../commons/CommonBackButton';
import { GameChapter } from '../../chapter/GameChapterTypes';
import { loadData } from '../../save/GameSaveRequests';
import { FullSaveState } from '../../save/GameSaveTypes';
import { getSourceAcademyGame } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';

class ChapterSelect extends Phaser.Scene {
  private chapterContainer: Phaser.GameObjects.Container | undefined;
  private backButtonContainer: Phaser.GameObjects.Container | undefined;
  private scrollSpeed: number;
  private chapterDetails: GameChapter[];
  private layerManager: GameLayerManager;
  private loadedGameState: FullSaveState | undefined;
  private autoScrolling: boolean;

  constructor() {
    super('ChapterSelect');

    this.chapterContainer = undefined;
    this.backButtonContainer = undefined;
    this.scrollSpeed = defaultScrollSpeed;
    this.chapterDetails = SampleChapters;
    this.layerManager = new GameLayerManager();
    this.autoScrolling = true;
  }

  public preload() {
    this.preloadAssets();
    this.layerManager.initialiseMainLayer(this);
    addLoadingScreen(this);
  }

  public async create() {
    const accountInfo = getSourceAcademyGame().getAccountInfo();
    this.loadedGameState = await loadData(accountInfo);
    this.renderBackground();
    this.renderChapters();
    this.autoScroll();
  }

  public update() {
    if (!this.chapterContainer) return;

    if (this.autoScrolling) {
      return;
    }
    let xOffset = this.input.x - screenCenter.x;
    if (Math.abs(xOffset) < imageRect.width / 2) {
      xOffset = 0;
    }
    this.scrollSpeed = limitNumber(-scrollSpeedLimit, xOffset, scrollSpeedLimit) * 0.2;
    this.chapterContainer.x = limitNumber(
      -imageDist * (this.chapterDetails.length - 1),
      this.chapterContainer.x - this.scrollSpeed,
      0
    );
  }

  private preloadAssets() {
    chapterSelectAssets.forEach(asset => this.load.image(asset.key, asset.path));
    this.chapterDetails.forEach((chapter, index) => {
      this.load.image(`chapterImage${index}`, chapter.previewBgPath);
    });
  }

  private renderBackground() {
    const background = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      chapterSelectBackground.key
    );
    this.layerManager.addToLayer(Layer.Background, background);
  }

  private renderChapters() {
    const mask = this.createMask();
    this.backButtonContainer = new CommonBackButton(
      this,
      () => {
        this.layerManager.clearAllLayers();
        this.scene.start('MainMenu');
      },
      0,
      0
    );
    this.chapterContainer = this.createChapterContainer();
    this.chapterContainer.mask = new Phaser.Display.Masks.GeometryMask(this, mask);

    this.layerManager.addToLayer(Layer.UI, this.chapterContainer);
    this.layerManager.addToLayer(Layer.UI, this.backButtonContainer);
  }

  private createMask() {
    const graphics = this.add.graphics();
    const mask = graphics
      .fillRect(maskRect.x, maskRect.y, maskRect.width, maskRect.height)
      .setPosition(screenCenter.x, screenCenter.y);
    mask.alpha = 0;
    return mask;
  }

  private createChapterContainer() {
    const chapterContainer = new Phaser.GameObjects.Container(this, 0, 0);
    chapterContainer.add(
      this.chapterDetails.map((chapterDetail, chapterIndex) => {
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
      this.getLoadedGameState().userState.lastCompletedChapter + 1,
      SampleChapters.length - 1
    );

    await this.scrollToIndex(chapterIdx);
    this.autoScrolling = false;
  }

  private async scrollToIndex(id: number) {
    if (!this.chapterContainer) return;
    const xTarget = -id * imageDist;

    const scrollDuration = 800;
    this.tweens.add({
      targets: this.chapterContainer,
      x: xTarget,
      ease: 'Power2',
      duration: scrollDuration
    });
    sleep(scrollDuration);
  }

  public getLoadedGameState() {
    if (!this.loadedGameState) {
      throw new Error('Cannot load game');
    }
    return this.loadedGameState;
  }
}

export default ChapterSelect;
