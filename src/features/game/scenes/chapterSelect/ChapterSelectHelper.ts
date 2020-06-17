import {
  imageRect,
  chapterSelectStyle,
  imageDist,
  chapterButtonsYOffset,
  chapterButtonsXOffset,
  chapterFrameXOffset,
  chapterFrameYOffset,
  chapterTextYOffset
} from './ChapterSelectConstants';
import ChapterSelect from './ChapterSelect';
import { screenCenter } from 'src/features/game/commons/CommonConstants';
import { ChapterDetail } from './ChapterSelectTypes';
import {
  chapterContinueButton,
  chapterRepeatButton,
  chapterSelectFrame
} from './ChapterSelectAssets';

export function createChapter(
  scene: ChapterSelect,
  { title, fileName }: ChapterDetail,
  index: number
) {
  const [x, y] = getCoorByChapter(index);
  const chapterContainer = new Phaser.GameObjects.Container(scene, x, y);

  // Chapter Preview
  const chapterPreview = new Phaser.GameObjects.Image(
    scene,
    0,
    0,
    `chapterImage${index}`
  ).setDisplaySize(imageRect.width, imageRect.height);

  // Chapter Frame
  const chapterFrame = new Phaser.GameObjects.Sprite(
    scene,
    chapterFrameXOffset,
    chapterFrameYOffset,
    chapterSelectFrame.key
  );

  // Chapter Actions
  const chapterRepeat = new Phaser.GameObjects.Sprite(
    scene,
    -chapterButtonsXOffset,
    chapterButtonsYOffset,
    chapterRepeatButton.key
  )
    .setInteractive({ pixelPerfect: true, useHandCursor: true })
    .addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      scene.loadFile(fileName, false, index);
    });

  const chapterContinue = new Phaser.GameObjects.Sprite(
    scene,
    chapterButtonsXOffset,
    chapterButtonsYOffset,
    chapterContinueButton.key
  )
    .setInteractive({ pixelPerfect: true, useHandCursor: true })
    .addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      scene.loadFile(fileName, true, index);
    });

  // Chapter Text
  const chapterText = `Chapter ${index}\n${title}`;
  const text = new Phaser.GameObjects.Text(
    scene,
    0,
    chapterTextYOffset,
    chapterText,
    chapterSelectStyle
  ).setOrigin(0.5);

  chapterContainer.add([chapterPreview, chapterFrame, chapterRepeat, chapterContinue, text]);

  return chapterContainer;
}

export function getCoorByChapter(chapterNum: number) {
  const x = screenCenter.x + imageDist * chapterNum;
  const y = screenCenter.y;
  return [x, y];
}
