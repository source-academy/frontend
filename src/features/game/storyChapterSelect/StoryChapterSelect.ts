import { Constants as c } from 'src/features/game/commons/CommonConstants';
import { limitNumber } from 'src/features/game/utils/GameUtils';
import { backgroundImageUrl } from 'src/features/game/storyChapterSelect/StoryChapterSelectConstants';
import { addLoadingScreen } from '../utils/LoadingScreen';
import { Color } from '../utils/styles';
import { fadeOut } from '../effects/FadeEffect';
import { ChapterDetail, SampleChapters } from './SampleChapters';

const marginX = 300;
const marginY = 100;

const maskX = -c.centerX + marginX;
const maskY = -c.centerY + marginY;
const maskWidth = c.screenWidth - marginX * 2;
const maskHeight = c.screenHeight - marginY * 2;

const imageWidth = 500;
const imageHeight = 700;

const horizontalDist = imageWidth + 150;
const blackTintAlpha = 0.8;

const textStyle = {
  fontFamily: 'Arial',
  fontSize: '36px',
  fill: Color.white,
  align: 'center',
  lineSpacing: 10
};

type Container = Phaser.GameObjects.Container;
const { Container, Image, Text, Rectangle } = Phaser.GameObjects;

class StoryChapterSelect extends Phaser.Scene {
  private chapterContainer: Container | undefined;
  private scrollSpeed: number;
  private chapterDetails: ChapterDetail[];

  constructor() {
    super('StoryChapterSelect');
    this.scrollSpeed = 10;
    this.chapterDetails = SampleChapters;
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
    this.add.image(c.centerX, c.centerY, 'bg');
  }

  private createMask() {
    const graphics = this.add.graphics();
    const mask = graphics
      .fillRect(maskX, maskY, maskWidth, maskHeight)
      .setPosition(c.centerX, c.centerY);
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
    let xOffset = this.input.x - c.centerX;
    if (Math.abs(xOffset) < 100) {
      xOffset = 0;
    }
    this.scrollSpeed = limitNumber(-100, xOffset, 100) * 0.2;
    this.chapterContainer.x = limitNumber(
      -horizontalDist * (this.chapterDetails.length - 1),
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
      this.scene.start('GameManager', { fileName: key });
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
    imageWidth,
    imageHeight
  );
  const blackTint = new Rectangle(scene, 0, 0, imageWidth, imageHeight, 0).setAlpha(blackTintAlpha);

  const chapterText = `Chapter ${index}\n${title}`;
  const text = new Text(scene, 0, 0, chapterText, textStyle).setOrigin(0.5);
  const container = new Container(scene, x, y, [image, blackTint, text]);
  container.setSize(imageWidth, imageHeight);
  container.setInteractive({
    useHandCursor: true
  });

  container.on('pointerover', () => {
    scene.add.tween(fadeOut([blackTint], c.fadeDuration * 2));
  });

  container.on('pointerout', () => {
    scene.add.tween({
      alpha: blackTintAlpha,
      targets: blackTint,
      duration: c.fadeDuration * 2
    });
  });

  container.on('pointerdown', () => {
    scene.loadFile(fileName);
  });

  return container;
}

function getCoorByChapter(chapterNum: number) {
  const x = c.centerX + horizontalDist * chapterNum;
  const y = c.centerY;
  return [x, y];
}

export default StoryChapterSelect;
