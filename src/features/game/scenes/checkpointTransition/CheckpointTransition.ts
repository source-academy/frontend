import { GameChapter } from '../../chapter/GameChapterTypes';
import { screenCenter } from '../../commons/CommonConstants';
import SourceAcademyGame, { GameType } from '../../SourceAcademyGame';
import { sleep } from '../../utils/GameUtils';
import { createBitmapText } from '../../utils/TextUtils';
import { callGameManagerForSim, callGameManagerOnTxtLoad } from '../../utils/TxtLoaderUtils';
import checkpointConstants, { transitionTextStyle } from './CheckpointTransitionConstants';

/**
 * This scene is triggered in between checkpoints/chapters.
 * From user's perspective, it is when the in-between scene that is triggered
 * after they completed a checkpoint.
 *
 * Internally, we use this scene to fully load the next checkpoint,
 * before finally loading the next scene.
 *
 * In story simulator, the next checkpoint is loaded based on the
 * chapterSimStack using the callGameManagerForSim function.
 *
 * We cannot load these informations at the start of GameManager as
 * it can alter the sequencing of preload() and create() in the GameManager.
 */
class CheckpointTransition extends Phaser.Scene {
  constructor() {
    super('CheckpointTransition');
  }

  public preload() {
    SourceAcademyGame.getInstance().setCurrentSceneRef(this);
  }

  public async create() {
    if (SourceAcademyGame.getInstance().isGameType(GameType.Simulator)) {
      await this.showTransitionText(checkpointConstants.checkpointText);
      await callGameManagerForSim();
      return;
    }

    // Fetch all the necessary informations: save state and chapter details.
    const loadedGameState = SourceAcademyGame.getInstance().getSaveManager().getFullSaveState();
    const chapterDetails = SourceAcademyGame.getInstance().getGameChapters();

    const [currChapter, currCheckpoint] = loadedGameState.userSaveState.recentlyPlayedCheckpoint;

    if (this.isLastCheckpoint(chapterDetails, currChapter, currCheckpoint)) {
      // If it is the last checkpoint, we mark that chapter is completed
      await SourceAcademyGame.getInstance().getSaveManager().saveChapterComplete(currChapter);
      if (this.isLastChapter(chapterDetails, currChapter)) {
        // No more chapter, transition to main menu instead
        this.scene.start('MainMenu');
        return;
      } else {
        // Transition to the next chapter, first checkpoint
        await this.showTransitionText(checkpointConstants.chapterText);
        await callGameManagerOnTxtLoad(true, currChapter + 1, 0);
        return;
      }
    } else {
      // Transition to the next checkpoint
      await this.showTransitionText(checkpointConstants.checkpointText);
      await callGameManagerOnTxtLoad(false, currChapter, currCheckpoint + 1);
      return;
    }
  }

  /**
   * In-game text to be shown during the checkpoint transition.
   *
   * @param text text to show
   */
  private async showTransitionText(text: string) {
    const transitionText = createBitmapText(
      this,
      text,
      screenCenter.x,
      screenCenter.y,
      transitionTextStyle
    )
      .setOrigin(0.5, 0.5)
      .setAlpha(0);

    this.add.existing(transitionText);

    // Fade in
    this.tweens.add({
      targets: transitionText,
      ...checkpointConstants.entryTween
    });

    await sleep(checkpointConstants.tweenDuration * 2);

    // Fade out
    this.tweens.add({
      targets: transitionText,
      ...checkpointConstants.exitTween
    });

    await sleep(checkpointConstants.tweenDuration);
  }

  /**
   * Checks whether the given checkpoint is the last checkpoint
   * of the chapter.
   *
   * @param chapterDetails the entire story collection of chapters' information
   * @param currChapter current chapter
   * @param currCheckpoint current checkpoint
   */
  private isLastCheckpoint(
    chapterDetails: GameChapter[],
    currChapter: number,
    currCheckpoint: number
  ) {
    return currCheckpoint >= chapterDetails[currChapter].filenames.length - 1;
  }

  /**
   * Checks whether the given chapter is the last chapter of the story.
   *
   * @param chapterDetails the entire story collection of chapters' information
   * @param currChapter current chapter
   */
  public isLastChapter(chapterDetails: GameChapter[], currChapter: number) {
    return currChapter >= chapterDetails.length - 1;
  }
}

export default CheckpointTransition;
