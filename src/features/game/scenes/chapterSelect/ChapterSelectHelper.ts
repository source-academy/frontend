import { screenCenter, screenSize } from '../../../game/commons/CommonConstants';
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
  ).setScale(0.99 * chapConstants.imageScale.x, 0.99 * chapConstants.imageScale.y);

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
  const chapterRepeatHover = new CommonTextHover(
    scene,
    chapConstants.resetButton.xOffset + 8,
    chapConstants.resetButton.yOffset - 20,
    'Reset progress'
  );
  const chapterContinueHover = new CommonTextHover(
    scene,
    chapConstants.playButton.xOffset + 8,
    chapConstants.playButton.yOffset - 20,
    'Play/Continue'
  );
  const chapterStarGoldHover = new CommonTextHover(
    scene,
    chapConstants.starGold.xOffset,
    chapConstants.starGold.yOffset,
    'Are you Steve Jobs in disguise?!'
  );
  const chapterStarSilverHover = new CommonTextHover(
    scene,
    chapConstants.starSilver.xOffset,
    chapConstants.starSilver.yOffset,
    'See Silver Awards'
  );
  const chapterStarBronzeHover = new CommonTextHover(
    scene,
    chapConstants.starBronze.xOffset,
    chapConstants.starBronze.yOffset,
    'See Bronze Awards'
  );

  // Chapter Actions
  const chapterRepeat = createButton(scene, {
    assetKey: ImageAssets.chapterRepeatButton.key,
    onUp: async () => await callGameManagerOnTxtLoad(false, index, 0),
    onHover: () => chapterRepeatHover.setVisible(true),
    onOut: () => chapterRepeatHover.setVisible(false)
  })
    .setPosition(chapConstants.resetButton.xOffset, chapConstants.resetButton.yOffset)
    .setScale(chapConstants.buttons.scale);

  const lastCheckpointPlayed = SourceAcademyGame.getInstance()
    .getSaveManager()
    .getChapterSaveState(index).lastCheckpointPlayed;

  //const chapterDetails = SourceAcademyGame.getInstance().getGameChapters();
  //const isComplete = () => lastCheckpointPlayed >= chapterDetails[index].filenames.length - 1;

  const chapterContinue = createButton(scene, {
    assetKey: ImageAssets.chapterContinueButton.key,
    onUp: async () => await callGameManagerOnTxtLoad(true, index, lastCheckpointPlayed),
    onHover: () => chapterContinueHover.setVisible(true),
    onOut: () => chapterContinueHover.setVisible(false)
  })
    .setPosition(chapConstants.playButton.xOffset, chapConstants.playButton.yOffset)
    .setScale(chapConstants.buttons.scale);

  const starGold = createButton(scene, {
    assetKey: ImageAssets.StarGold.key,
    onHover: () => chapterStarGoldHover.setVisible(true),
    onOut: () => chapterStarGoldHover.setVisible(false)
  })
    .setScale(0.05)
    .setPosition(chapConstants.starGold.xOffset, chapConstants.starGold.yOffset)
    .setVisible(false);

  const starSilver = createButton(scene, {
    assetKey: ImageAssets.StarSilver.key,
    onHover: () => chapterStarSilverHover.setVisible(true),
    onOut: () => chapterStarSilverHover.setVisible(false)
  })
    .setScale(0.05)
    .setPosition(chapConstants.starSilver.xOffset, chapConstants.starSilver.yOffset)
    .setVisible(false);

  const starBronze = createButton(scene, {
    assetKey: ImageAssets.StarBronze.key,
    onHover: () => chapterStarBronzeHover.setVisible(true),
    onOut: () => chapterStarBronzeHover.setVisible(false)
  })
    .setScale(0.05)
    .setPosition(chapConstants.starBronze.xOffset, chapConstants.starBronze.yOffset)
    .setVisible(false);

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
    starGold,
    starSilver,
    starBronze,
    chapterStarGoldHover,
    chapterStarSilverHover,
    chapterStarBronzeHover,
    chapterRepeatHover,
    chapterContinueHover,
    chapterIndexText,
    chapterTitleText,
    blackTint
  ]);

  return chapterContainer;
}

function getCoorByChapter(chapterNum: number) {
  const page = Math.floor(chapterNum / chapConstants.grid.chapPerPage);
  chapterNum %= chapConstants.grid.chapPerPage;
  const row = Math.floor(chapterNum / chapConstants.grid.chapPerRow);
  const col = chapterNum % chapConstants.grid.chapPerRow;

  const centreCol = (chapConstants.grid.chapPerRow - 1) / 2;
  const centreRow = (chapConstants.grid.chapPerCol - 1) / 2;

  let x = page * screenSize.x + screenCenter.x;
  x += (col - centreCol) * (chapConstants.imageRect.width + chapConstants.grid.chapGapX);
  let y = screenCenter.y;
  y += (row - centreRow) * (chapConstants.imageRect.height + chapConstants.grid.chapGapY);

  return [x, y];
}
