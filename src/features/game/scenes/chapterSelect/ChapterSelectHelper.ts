import chapConstants, {
  chapterActionAltStyle,
  chapterIndexStyle,
  chapterTitleStyle
} from './ChapterSelectConstants';
import ChapterSelect from './ChapterSelect';
import { screenCenter } from 'src/features/game/commons/CommonConstants';
import { GameChapter } from '../../chapter/GameChapterTypes';
import { callGameManagerOnTxtLoad } from '../../utils/TxtLoaderUtils';
import { HexColor } from '../../utils/StyleUtils';
import { BitmapFontStyle } from '../../commons/CommonTypes';
import { createBitmapText } from '../../utils/TextUtils';
import ImageAssets from '../../assets/ImageAssets';
import { createButton } from '../../utils/ButtonUtils';

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
  const chapterRepeatPopup = createHoverTextContainer(
    scene,
    'Reset progress',
    chapterActionAltStyle
  ).setPosition(
    chapConstants.buttonsXOffset + chapConstants.altTextXOffset,
    chapConstants.buttonsYOffset + chapConstants.altTextYOffset
  );

  const chapterContinuePopup = createHoverTextContainer(
    scene,
    'Play/Continue',
    chapterActionAltStyle
  ).setPosition(
    -chapConstants.buttonsXOffset + chapConstants.altTextXOffset,
    chapConstants.buttonsYOffset + chapConstants.altTextYOffset
  );

  // Chapter Actions
  const chapterRepeat = createButton(
    scene,
    '',
    ImageAssets.chapterRepeatButton.key,
    { x: 0, y: 0, oriX: 0.5, oriY: 0.5 },
    undefined,
    undefined,
    () => callGameManagerOnTxtLoad(scene, scene.chapterDetails, false, index, 0),
    () => chapterRepeatPopup.setVisible(true),
    () => chapterRepeatPopup.setVisible(false)
  ).setPosition(chapConstants.buttonsXOffset, chapConstants.buttonsYOffset);

  const chapterContinue = createButton(
    scene,
    '',
    ImageAssets.chapterContinueButton.key,
    { x: 0, y: 0, oriX: 0.5, oriY: 0.5 },
    undefined,
    undefined,
    () => callGameManagerOnTxtLoad(scene, scene.chapterDetails, true, index, lastCheckpointsIdx),
    () => chapterContinuePopup.setVisible(true),
    () => chapterContinuePopup.setVisible(false)
  ).setPosition(-chapConstants.buttonsXOffset, chapConstants.buttonsYOffset);

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

  const chapterDone = index <= scene.getLoadedGameState().userState.lastCompletedChapter + 1;

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
    chapterRepeatPopup,
    chapterContinuePopup,
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

function createHoverTextContainer(
  scene: Phaser.Scene,
  text: string,
  style: BitmapFontStyle,
  textPad: number = 10
) {
  const altTextBg = new Phaser.GameObjects.Rectangle(
    scene,
    0,
    0,
    text.length * style.size * 0.7,
    style.size * 2,
    HexColor.darkBlue
  )
    .setOrigin(0.0, 0.5)
    .setAlpha(0.8);
  const altText = createBitmapText(scene, text, textPad, 0, style).setOrigin(0.0, 0.5);
  const altTextContainer = new Phaser.GameObjects.Container(scene, 0, 0, [altTextBg, altText]);
  altTextContainer.setVisible(false);
  return altTextContainer;
}
