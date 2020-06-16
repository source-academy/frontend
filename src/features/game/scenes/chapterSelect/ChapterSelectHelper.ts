import {
  imageRect,
  chapterSelectStyle,
  imageDist,
  chapterButtonsYOffset,
  chapterButtonsXOffset
} from './ChapterSelectConstants';
import ChapterSelect from './ChapterSelect';
import { screenCenter } from 'src/features/game/commons/CommonConstants';
import { ChapterDetail } from './ChapterSelectTypes';
import { chapterContinueButton, chapterRepeatButton } from './ChapterSelectAssets';

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

  // Chapter Actions
  const chapterRepeat = new Phaser.GameObjects.Sprite(
    scene,
    -chapterButtonsXOffset,
    chapterButtonsYOffset,
    chapterRepeatButton.key
  ).setInteractive({ pixelPerfect: true, useHandCursor: true })
    .addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      scene.loadFile(fileName);
    });

  const chapterContinue = new Phaser.GameObjects.Sprite(
    scene,
    chapterButtonsXOffset,
    chapterButtonsYOffset,
    chapterContinueButton.key
  ).setInteractive({ pixelPerfect: true, useHandCursor: true })
    .addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      scene.loadFile(fileName);
    });

  // Chapter Text
  const chapterText = `Chapter ${index}\n${title}`;
  const text = new Phaser.GameObjects.Text(scene, 0, 0, chapterText, chapterSelectStyle).setOrigin(
    0.5
  );

  chapterContainer.add([chapterPreview, chapterRepeat, chapterContinue, text]);
  chapterContainer.setSize(imageRect.width, imageRect.height);

  return chapterContainer;
}

export function getCoorByChapter(chapterNum: number) {
  const x = screenCenter.x + imageDist * chapterNum;
  const y = screenCenter.y;
  return [x, y];
}
