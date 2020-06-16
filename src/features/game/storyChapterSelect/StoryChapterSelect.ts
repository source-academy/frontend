import { screenCenter, screenSize, Constants } from 'src/features/game/commons/CommonConstants';
import { limitNumber } from 'src/features/game/utils/GameUtils';
import { backgroundImageUrl } from 'src/features/game/storyChapterSelect/StoryChapterSelectConstants';
import { addLoadingScreen } from '../utils/LoadingScreen';
import { Color } from '../utils/styles';
import { fadeOut } from '../effects/FadeEffect';
import { ChapterDetail, SampleChapters } from './SampleChapters';
import { RequestOptions } from 'https';

const marginX = 300;
const marginY = 100;
const blackTintAlpha = 0.8;

const maskRect = {
  x: -screenCenter.x + marginX,
  y: -screenCenter.y + marginY,
  width: screenSize.x - marginX * 2,
  height: screenSize.y - marginY * 2
};

const imageRect = {
  width: 500,
  height: 700
};

const imageDist = imageRect.width + 150;

const textStyle = {
  fontFamily: 'Arial',
  fontSize: '36px',
  fill: Color.white,
  align: 'center',
  lineSpacing: 10
};

type Container = Phaser.GameObjects.Container;
const { Container, Image, Text, Rectangle } = Phaser.GameObjects;

export type AccountInfo = {
  accessToken: string;
  refreshToken: string;
};

export type RequestFn = (
  path: string,
  method: string,
  opts: RequestOptions
) => Promise<Response | null>;

class StoryChapterSelect extends Phaser.Scene {
  private chapterContainer: Container | undefined;
  private scrollSpeed: number;
  private chapterDetails: ChapterDetail[];

  private accountInfo: AccountInfo | undefined;

  constructor() {
    super('StoryChapterSelect');
    this.scrollSpeed = 10;
    this.chapterDetails = SampleChapters;
  }

  init(accountInfo: AccountInfo) {
    this.accountInfo = accountInfo;
  }

  public preload() {
    this.load.image('bg', backgroundImageUrl);

    this.chapterDetails.forEach((chapter, index) => {
      this.load.image(`chapterImage${index}`, chapter.url);
    });
    addLoadingScreen(this);
  }

  public create() {
    this.addBackground();
    const mask = this.createMask();
    this.chapterContainer = this.createChapterContainer();
    this.add.existing(this.chapterContainer);

    this.chapterContainer.mask = new Phaser.Display.Masks.GeometryMask(this, mask);
  }

  private addBackground() {
    this.add.image(screenCenter.x, screenCenter.y, 'bg');
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
    const chapterContainer = new Container(this, 0, 0);
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

function createChapter(
  scene: StoryChapterSelect,
  { title, fileName }: ChapterDetail,
  index: number
) {
  const [x, y] = getCoorByChapter(index);
  const image = new Image(scene, 0, 0, `chapterImage${index}`).setDisplaySize(
    imageRect.width,
    imageRect.height
  );
  const blackTint = new Rectangle(scene, 0, 0, imageRect.width, imageRect.height, 0).setAlpha(
    blackTintAlpha
  );

  const chapterText = `Chapter ${index}\n${title}`;
  const text = new Text(scene, 0, 0, chapterText, textStyle).setOrigin(0.5);
  const container = new Container(scene, x, y, [image, blackTint, text]);
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

export default StoryChapterSelect;
