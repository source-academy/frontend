import { screenCenter } from 'src/features/game/commons/CommonConstants';

import ImageAssets from '../../assets/ImageAssets';
import { GameChapter } from '../../chapter/GameChapterTypes';
import CommonTextHover from '../../commons/CommonTextHover';
import { createButton } from '../../utils/ButtonUtils';
import { createBitmapText } from '../../utils/TextUtils';
import { callGameManagerOnTxtLoad } from '../../utils/TxtLoaderUtils';
import ChapterSelect from './ChapterSelect';
import chapConstants, {
  chapterActionAltStyle,
  chapterIndexStyle,
  chapterTitleStyle
} from './ChapterSelectConstants';

export function createChapter(
  scene: ChapterSelect,
  { title }: GameChapter,
  index: number,
  lastCheckpointsIdx: number
) {
  const [x, y] = getCoorByChapter(index);
  const chapterContainer = new Phaser.GameObjects.Container(scene, x, y);

  // Chapter Preview
  const chapterPreview = new Phaser.GameObjects.Image(
    scene,
    0,
    0,
    `chapterImage${index}`
  ).setDisplaySize(chapConstants.imageRect.width, chapConstants.imageRect.height);

  // Chapter Frame
  const chapterFrame = new Phaser.GameObjects.Sprite(
    scene,
    chapConstants.frameXOffset,
    chapConstants.frameYOffset,
    ImageAssets.chapterSelectFrame.key
  );

  // Chapter Action Popup
  const chapterRepeatHover = new CommonTextHover(
    scene,
    0,
    0,
    'Reset progress',
    chapterActionAltStyle
  );
  const chapterContinueHover = new CommonTextHover(
    scene,
    0,
    0,
    'Play/Continue',
    chapterActionAltStyle
  );

  // Chapter Actions
  const chapterRepeat = createButton(scene, {
    assetKey: ImageAssets.chapterRepeatButton.key,
    onUp: () => callGameManagerOnTxtLoad(scene, scene.chapterDetails, false, index, 0),
    onHover: () => chapterRepeatHover.setVisible(true),
    onOut: () => chapterRepeatHover.setVisible(false),
    onPointerMove: (pointer: Phaser.Input.Pointer) => {
      chapterRepeatHover.x = pointer.worldX - chapterContainer.x;
      chapterRepeatHover.y = pointer.worldY - chapterContainer.y;
    }
  }).setPosition(chapConstants.buttonsXOffset, chapConstants.buttonsYOffset);

  const chapterContinue = createButton(scene, {
    assetKey: ImageAssets.chapterContinueButton.key,
    onUp: () =>
      callGameManagerOnTxtLoad(scene, scene.chapterDetails, true, index, lastCheckpointsIdx),
    onHover: () => chapterContinueHover.setVisible(true),
    onOut: () => chapterContinueHover.setVisible(false),
    onPointerMove: (pointer: Phaser.Input.Pointer) => {
      chapterContinueHover.x = pointer.worldX - chapterContainer.x;
      chapterContinueHover.y = pointer.worldY - chapterContainer.y;
    }
  }).setPosition(-chapConstants.buttonsXOffset, chapConstants.buttonsYOffset);

  // Chapter Text
  const chapterIndexText = createBitmapText(
    scene,
    `Chapter ${index}`,
    0,
    chapConstants.indexYOffset,
    chapterIndexStyle
  ).setOrigin(0.5, 0.5);

  const chapterTitleText = createBitmapText(
    scene,
    title,
    0,
    chapConstants.titleYOffset,
    chapterTitleStyle
  ).setOrigin(0.5, 0.5);

  const chapterDone = index <= scene.getLoadedGameState().userSaveState.lastCompletedChapter + 1;

  const blackTint = new Phaser.GameObjects.Rectangle(
    scene,
    0,
    0,
    chapConstants.imageRect.width,
    chapConstants.imageRect.height,
    0
  )
    .setOrigin(0.5)
    .setAlpha(chapterDone ? 0 : 0.8)
    .setInteractive();

  chapterContainer.add([
    chapterPreview,
    chapterFrame,
    chapterRepeat,
    chapterContinue,
    chapterRepeatHover,
    chapterContinueHover,
    chapterIndexText,
    chapterTitleText,
    blackTint
  ]);

  return chapterContainer;
}

export function getCoorByChapter(chapterNum: number) {
  const x = screenCenter.x + chapConstants.imageDist * chapterNum;
  const y = screenCenter.y;
  return [x, y];
}
