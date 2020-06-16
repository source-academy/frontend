import { screenCenter, Constants } from 'src/features/game/commons/CommonConstants';
import { limitNumber } from 'src/features/game/utils/GameUtils';
import { addLoadingScreen } from '../../utils/LoadingScreen';
import { fadeOut } from '../../effects/FadeEffect';
import { ChapterDetail, SampleChapters } from './SampleChapters';
import { chapterSelectAssets, chapterSelectBackground } from './ChapterSelectAssets';
import {
  defaultScrollSpeed,
  maskRect,
  imageDist,
  imageRect,
  blackTintAlpha,
  chapterSelectStyle
} from './ChapterSelectConstants';

export type AccountInfo = {
  accessToken: string;
  refreshToken: string;
};

class ChapterSelect extends Phaser.Scene {
  private chapterContainer: Phaser.GameObjects.Container | undefined;
  private scrollSpeed: number;
  private chapterDetails: ChapterDetail[];
  private accountInfo: AccountInfo | undefined;

  constructor() {
    super('ChapterSelect');

    this.scrollSpeed = defaultScrollSpeed;
    this.chapterDetails = SampleChapters;
  }

  init(accountInfo: AccountInfo) {
    this.accountInfo = accountInfo;
  }

  public preload() {
    this.preloadAssets();
    addLoadingScreen(this);
  }

  private preloadAssets() {
    chapterSelectAssets.forEach(asset => this.load.image(asset.key, asset.path));
    this.chapterDetails.forEach((chapter, index) => {
      this.load.image(`chapterImage${index}`, chapter.url);
    });
  }

  public create() {
    this.renderBackground();
    const mask = this.createMask();
    this.chapterContainer = this.createChapterContainer();
    this.add.existing(this.chapterContainer);

    this.chapterContainer.mask = new Phaser.Display.Masks.GeometryMask(this, mask);
  }

  private renderBackground() {
    this.add.image(screenCenter.x, screenCenter.y, chapterSelectBackground.key);
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

  public update() {
    if (!this.chapterContainer) return;
    let xOffset = this.input.x - screenCenter.x;
    if (Math.abs(xOffset) < 100) {
      xOffset = 0;
    }
    this.scrollSpeed = limitNumber(-100, xOffset, 100) * 0.2;
    this.chapterContainer.x = limitNumber(
      -imageDist * (this.chapterDetails.length - 1),
      this.chapterContainer.x - this.scrollSpeed,
      0
    );
  }

  public loadFile(fileName: string) {
    this.load.text(`#${fileName}`, fileName);
    this.load.once('filecomplete', (key: string) => this.callGameManager(key));
    this.load.start();
  }

  private callGameManager(key: string) {
    if (key[0] === '#') {
      const text = this.cache.text.get(key);
      this.scene.start('GameManager', { text, accountInfo: this.accountInfo });
    }
  }
}

function createChapter(scene: ChapterSelect, { title, fileName }: ChapterDetail, index: number) {
  const [x, y] = getCoorByChapter(index);
  const image = new Phaser.GameObjects.Image(scene, 0, 0, `chapterImage${index}`).setDisplaySize(
    imageRect.width,
    imageRect.height
  );
  const blackTint = new Phaser.GameObjects.Rectangle(
    scene,
    0,
    0,
    imageRect.width,
    imageRect.height,
    0
  ).setAlpha(blackTintAlpha);

  const chapterText = `Chapter ${index}\n${title}`;
  const text = new Phaser.GameObjects.Text(scene, 0, 0, chapterText, chapterSelectStyle).setOrigin(
    0.5
  );
  const container = new Phaser.GameObjects.Container(scene, x, y, [image, blackTint, text]);
  container.setSize(imageRect.width, imageRect.height);
  container.setInteractive({
    useHandCursor: true
  });

  container.on('pointerover', () => {
    scene.add.tween(fadeOut([blackTint], Constants.fadeDuration * 2));
  });

  container.on('pointerout', () => {
    scene.add.tween({
      alpha: blackTintAlpha,
      targets: blackTint,
      duration: Constants.fadeDuration * 2
    });
  });

  container.on('pointerdown', () => {
    scene.loadFile(fileName);
  });

  return container;
}

function getCoorByChapter(chapterNum: number) {
  const x = screenCenter.x + imageDist * chapterNum;
  const y = screenCenter.y;
  return [x, y];
}

export default ChapterSelect;
