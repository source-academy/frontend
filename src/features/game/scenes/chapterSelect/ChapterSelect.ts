import { screenCenter } from 'src/features/game/commons/CommonConstants';
import { limitNumber } from 'src/features/game/utils/GameUtils';
import { addLoadingScreen } from '../../effects/LoadingScreen';
import { SampleChapters } from './SampleChapters';
import { ChapterDetail } from './ChapterSelectTypes';
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
import { topButton } from '../../commons/CommonAssets';
import { backButtonStyle, backText, backTextYPos } from '../../mode/GameModeTypes';

export type AccountInfo = {
  accessToken: string;
  refreshToken: string;
};

class ChapterSelect extends Phaser.Scene {
  private chapterContainer: Phaser.GameObjects.Container | undefined;
  private backButtonContainer: Phaser.GameObjects.Container | undefined;
  private scrollSpeed: number;
  private chapterDetails: ChapterDetail[];
  private accountInfo: AccountInfo | undefined;
  private layerManager: GameLayerManager;

  constructor() {
    super('ChapterSelect');

    this.chapterContainer = undefined;
    this.backButtonContainer = undefined;
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
    this.backButtonContainer = this.createBackButtonContainer();
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

  private createBackButtonContainer() {
    const backButtonContainer = new Phaser.GameObjects.Container(this, 0, 0);
    const backButtonText = new Phaser.GameObjects.Text(
      this,
      screenCenter.x,
      backTextYPos,
      backText,
      backButtonStyle
    ).setOrigin(0.5, 0.25);

    const backButtonSprite = new Phaser.GameObjects.Sprite(
      this,
      screenCenter.x,
      screenCenter.y,
      topButton.key
    );
    backButtonSprite.setInteractive({ pixelPerfect: true, useHandCursor: true });
    backButtonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      this.layerManager.clearAllLayers();
      this.scene.start('MainMenu');
    });
    backButtonContainer.add([backButtonSprite, backButtonText]);
    return backButtonContainer;
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
