import {
  imageRect,
  imageDist,
  chapterButtonsYOffset,
  chapterButtonsXOffset,
  chapterFrameXOffset,
  chapterFrameYOffset,
  chapterTitleYOffset,
  chapterActionAltStyle,
  chapterIndexStyle,
  chapterTitleStyle,
  chapterIndexYOffset
} from './ChapterSelectConstants';
import ChapterSelect from './ChapterSelect';
import { screenCenter } from 'src/features/game/commons/CommonConstants';
import {
  chapterContinueButton,
  chapterRepeatButton,
  chapterSelectFrame
} from './ChapterSelectAssets';
import { GameChapter } from '../../chapter/GameChapterTypes';
import { callGameManagerOnTxtLoad } from '../../utils/TxtLoaderUtils';
import { HexColor } from '../../utils/StyleUtils';
import { BitmapFontStyle } from '../../commons/CommonTypes';

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
  ).setDisplaySize(imageRect.width, imageRect.height);

  // Chapter Frame
  const chapterFrame = new Phaser.GameObjects.Sprite(
    scene,
    chapterFrameXOffset,
    chapterFrameYOffset,
    chapterSelectFrame.key
  );

  // Chapter Action Popup
  const chapterRepeatPopup = createHoverTextContainer(
    scene,
    'Reset progress',
    chapterActionAltStyle
  );
  const chapterContinuePopup = createHoverTextContainer(
    scene,
    'Play/Continue',
    chapterActionAltStyle
  );
  chapterRepeatPopup
    .setPosition(chapterButtonsXOffset + 120, chapterButtonsYOffset - 40)
    .setVisible(false);
  chapterContinuePopup
    .setPosition(-chapterButtonsXOffset + 120, chapterButtonsYOffset - 40)
    .setVisible(false);

  // Chapter Actions
  const chapterRepeat = new Phaser.GameObjects.Sprite(
    scene,
    chapterButtonsXOffset,
    chapterButtonsYOffset,
    chapterRepeatButton.key
  )
    .setInteractive({ pixelPerfect: true, useHandCursor: true })
    .addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      callGameManagerOnTxtLoad(scene, scene.chapterDetails, false, index, 0);
    })
    .addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () =>
      chapterRepeatPopup.setVisible(true)
    )
    .addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () =>
      chapterRepeatPopup.setVisible(false)
    );

  const chapterContinue = new Phaser.GameObjects.Sprite(
    scene,
    -chapterButtonsXOffset,
    chapterButtonsYOffset,
    chapterContinueButton.key
  )
    .setInteractive({ pixelPerfect: true, useHandCursor: true })
    .addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      callGameManagerOnTxtLoad(scene, scene.chapterDetails, true, index, lastCheckpointsIdx);
    })
    .addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () =>
      chapterContinuePopup.setVisible(true)
    )
    .addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () =>
      chapterContinuePopup.setVisible(false)
    );

  // Chapter Text
  const chapterIndexText = new Phaser.GameObjects.BitmapText(
    scene,
    0,
    chapterIndexYOffset,
    chapterIndexStyle.key,
    `Chapter ${index}`,
    chapterIndexStyle.size,
    chapterIndexStyle.align
  )
    .setTintFill(chapterIndexStyle.fill)
    .setOrigin(0.5, 0.5);

  const chapterTitleText = new Phaser.GameObjects.BitmapText(
    scene,
    0,
    chapterTitleYOffset,
    chapterTitleStyle.key,
    title,
    chapterTitleStyle.size,
    chapterTitleStyle.align
  )
    .setTintFill(chapterTitleStyle.fill)
    .setOrigin(0.5, 0.5);

  const chapterDone = index <= scene.getLoadedGameState().userState.lastCompletedChapter + 1;

  const blackTint = new Phaser.GameObjects.Rectangle(
    scene,
    0,
    0,
    imageRect.width,
    imageRect.height,
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
    chapterRepeatPopup,
    chapterContinuePopup,
    chapterIndexText,
    chapterTitleText,
    blackTint
  ]);

  return chapterContainer;
}

export function getCoorByChapter(chapterNum: number) {
  const x = screenCenter.x + imageDist * chapterNum;
  const y = screenCenter.y;
  return [x, y];
}

function createHoverTextContainer(scene: Phaser.Scene, text: string, style: BitmapFontStyle) {
  const altTextBg = new Phaser.GameObjects.Rectangle(
    scene,
    0,
    0,
    180,
    50,
    HexColor.darkBlue
  ).setAlpha(0.8);
  const altText = new Phaser.GameObjects.BitmapText(
    scene,
    0,
    0,
    style.key,
    text,
    style.size,
    style.align
  )
    .setOrigin(0.5, 0.5)
    .setTintFill(style.fill);
  const altTextContainer = new Phaser.GameObjects.Container(scene, 0, 0, [altTextBg, altText]);
  return altTextContainer;
}
