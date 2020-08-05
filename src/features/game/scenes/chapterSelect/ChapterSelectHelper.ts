import { screenCenter } from '../../../game/commons/CommonConstants';
import ImageAssets from '../../assets/ImageAssets';
import { GameChapter } from '../../chapter/GameChapterTypes';
import CommonTextHover from '../../commons/CommonTextHover';
import SourceAcademyGame from '../../SourceAcademyGame';
import { createButton } from '../../utils/ButtonUtils';
import { createBitmapText } from '../../utils/TextUtils';
import { callGameManagerOnTxtLoad } from '../../utils/TxtLoaderUtils';
import ChapterSelect from './ChapterSelect';
import chapConstants, { chapterIndexStyle, chapterTitleStyle } from './ChapterSelectConstants';

/**
 * Create a chapter selection and formats it.
 *
 * It will use the chapter preview background and set it as the
 * chapter selection background.
 *
 * Additionally, this method attach a 'Play/Continue' button and
 * 'Reset Progress' button to the chapter selection; with an already
 * set up button functionality.
 *
 * @param scene scene for the chapter selection container to attach to
 * @param title title of the chapter
 * @param imageUrl url of the preview image
 * @param index index of chapter
 * @param lastCheckpointsIdx last checkpoint to continue users' progression from
 */
export function createChapter(
  scene: ChapterSelect,
  { title, imageUrl }: GameChapter,
  index: number
) {
  const [x, y] = getCoorByChapter(index);
  const chapterContainer = new Phaser.GameObjects.Container(scene, x, y);

  const chapterDone =
    index <= SourceAcademyGame.getInstance().getSaveManager().getLargestCompletedChapterNum();

  // Chapter Preview
  const chapterPreview = new Phaser.GameObjects.Image(scene, 0, 0, imageUrl).setDisplaySize(
    chapConstants.imageRect.width,
    chapConstants.imageRect.height
  );

  // Chapter Frame + blue tint
  const chapterFrame = new Phaser.GameObjects.Sprite(
    scene,
    chapConstants.frame.xOffset,
    chapConstants.frame.yOffset,
    ImageAssets.chapterSelectFrame.key
  );

  // Chapter completed rectangle
  const chapCompleteRect = new Phaser.GameObjects.Rectangle(
    scene,
    0,
    chapConstants.chapComplete.y,
    chapConstants.imageRect.width,
    chapConstants.chapComplete.height,
    0
  )
    .setOrigin(0.5)
    .setAlpha(0.7)
    .setInteractive()
    .setVisible(chapterDone);

  // Chapter complete text
  const chapCompleteText = createBitmapText(
    scene,
    chapConstants.chapComplete.text,
    { x: 0, y: chapConstants.chapComplete.y, oriX: 0.5, oriY: 0.5 },
    chapterIndexStyle
  ).setVisible(chapterDone);

  // Chapter Action Popup
  const chapterRepeatHover = new CommonTextHover(scene, 0, 0, 'Reset progress');
  const chapterContinueHover = new CommonTextHover(scene, 0, 0, 'Play/Continue');

  // Chapter Actions
  const chapterRepeat = createButton(scene, {
    assetKey: ImageAssets.chapterRepeatButton.key,
    onUp: async () => await callGameManagerOnTxtLoad(false, index, 0),
    onHover: () => chapterRepeatHover.setVisible(true),
    onOut: () => chapterRepeatHover.setVisible(false),
    onPointerMove: (pointer: Phaser.Input.Pointer) => {
      chapterRepeatHover.x = pointer.worldX - chapterContainer.x;
      chapterRepeatHover.y = pointer.worldY - chapterContainer.y;
    }
  }).setPosition(chapConstants.button.xOffset, chapConstants.button.yOffset);

  const lastCheckpointPlayed = SourceAcademyGame.getInstance()
    .getSaveManager()
    .getChapterSaveState(index).lastCheckpointPlayed;

  const chapterContinue = createButton(scene, {
    assetKey: ImageAssets.chapterContinueButton.key,
    onUp: async () => await callGameManagerOnTxtLoad(true, index, lastCheckpointPlayed),
    onHover: () => chapterContinueHover.setVisible(true),
    onOut: () => chapterContinueHover.setVisible(false),
    onPointerMove: (pointer: Phaser.Input.Pointer) => {
      chapterContinueHover.x = pointer.worldX - chapterContainer.x;
      chapterContinueHover.y = pointer.worldY - chapterContainer.y;
    }
  }).setPosition(-chapConstants.button.xOffset, chapConstants.button.yOffset);

  // Chapter Text
  const chapterIndexText = createBitmapText(
    scene,
    `Chapter ${index}`,
    chapConstants.indexTextConfig,
    chapterIndexStyle
  );

  const chapterTitleText = createBitmapText(
    scene,
    title,
    chapConstants.titleTextConfig,
    chapterTitleStyle
  );

  const chapterAccessible =
    index <= SourceAcademyGame.getInstance().getSaveManager().getLargestCompletedChapterNum() + 1;

  const blackTint = new Phaser.GameObjects.Rectangle(
    scene,
    0,
    0,
    chapConstants.imageRect.width,
    chapConstants.imageRect.height,
    0
  )
    .setOrigin(0.5)
    .setAlpha(chapterAccessible ? 0 : 0.8)
    .setInteractive();

  chapterContainer.add([
    chapterPreview,
    chapterFrame,
    chapCompleteRect,
    chapCompleteText,
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
