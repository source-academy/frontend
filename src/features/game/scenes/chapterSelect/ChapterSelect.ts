import { screenCenter } from 'src/features/game/commons/CommonConstants';
import { limitNumber } from 'src/features/game/utils/GameUtils';
import { addLoadingScreen } from '../../effects/LoadingScreen';
import { SampleChapters } from './SampleChapters';
import { ChapterDetail } from './ChapterSelectTypes';
import { chapterSelectAssets, chapterSelectBackground } from './ChapterSelectAssets';
import { defaultScrollSpeed, maskRect, imageDist } from './ChapterSelectConstants';
import { createChapter } from './ChapterSelectHelper';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';

export type AccountInfo = {
  accessToken: string;
  refreshToken: string;
};

class ChapterSelect extends Phaser.Scene {
  private chapterContainer: Phaser.GameObjects.Container | undefined;
  private scrollSpeed: number;
  private chapterDetails: ChapterDetail[];
  private accountInfo: AccountInfo | undefined;
  private layerManager: GameLayerManager;

  constructor() {
    super('ChapterSelect');

    this.chapterContainer = undefined;
    this.scrollSpeed = defaultScrollSpeed;
    this.chapterDetails = SampleChapters;
    this.accountInfo = undefined;
    this.layerManager = new GameLayerManager();
  }

  init(accountInfo: AccountInfo) {
    this.accountInfo = accountInfo;
  }

  public preload() {
    this.preloadAssets();
    this.layerManager.initialiseMainLayer(this);
    addLoadingScreen(this);
  }

  public create() {
    this.renderBackground();
    this.renderChapters();
  }

  public update() {
    if (!this.chapterContainer) return;
    let xOffset = this.input.x - screenCenter.x;
    if (Math.abs(xOffset) < 100) {
      xOffset = 0;
    }
    this.scrollSpeed = limitNumber(-50, xOffset, 50) * 0.2;
    this.chapterContainer.x = limitNumber(
      -imageDist * (this.chapterDetails.length - 1),
      this.chapterContainer.x - this.scrollSpeed,
      0
    );
  }

  public loadFile(fileName: string, continueGame: boolean, chapterNum: number) {
    this.load.text(`#${fileName}`, fileName);
    this.load.once('filecomplete', (key: string) =>
      this.callGameManager(key, continueGame, chapterNum)
    );
    this.load.start();
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
    this.chapterContainer = this.createChapterContainer();
    this.chapterContainer.mask = new Phaser.Display.Masks.GeometryMask(this, mask);

    this.layerManager.addToLayer(Layer.UI, this.chapterContainer);
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
      this.chapterDetails.map((chapterDetail, index) => createChapter(this, chapterDetail, index))
    );
    return chapterContainer;
  }

  private callGameManager(key: string, continueGame: boolean, chapterNum: number) {
    if (key[0] === '#') {
      const text = this.cache.text.get(key);
      this.scene.start('GameManager', {
        text,
        accountInfo: this.accountInfo,
        continueGame: continueGame,
        chapterNum: chapterNum
      });
    }
  }
}

export default ChapterSelect;
