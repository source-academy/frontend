import { GameChapter } from '../../chapter/GameChapterTypes';
import { screenCenter } from '../../commons/CommonConstants';
import { loadData, saveData } from '../../save/GameSaveRequests';
import { FullSaveState } from '../../save/GameSaveTypes';
import SourceAcademyGame from '../../SourceAcademyGame';
import { sleep } from '../../utils/GameUtils';
import { createBitmapText } from '../../utils/TextUtils';
import { callGameManagerOnTxtLoad } from '../../utils/TxtLoaderUtils';
import { SampleChapters } from '../chapterSelect/SampleChapters';
import checkpointConstants, { transitionTextStyle } from './CheckpointTransitionConstants';

/**
 * This scene is triggered in between checkpoints/chapters.
 * From user's perspective, it is when the in-between scene that is triggered
 * after they completed a checkpoint.
 *
 * Internally, we use this scene to fully load students information
 * as well as get the next checkpoint, before finally loading the next scene.
 *
 * We cannot load these informations at the GameManager as
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
    const loadedGameState = await loadData();
    const chapterDetails = SampleChapters; // TODO: Fetch from backend

    const [currChapter, currCheckpoint] = loadedGameState.userSaveState.lastPlayedCheckpoint;

    if (this.isLastCheckpoint(chapterDetails, currChapter, currCheckpoint)) {
      await this.saveChapterComplete(loadedGameState, currChapter);
      if (currChapter >= chapterDetails.length - 1) {
        this.scene.start('MainMenu');
        return;
      } else {
        await this.showTransitionText(checkpointConstants.chapterText);
        await callGameManagerOnTxtLoad(this, chapterDetails, true, currChapter + 1, 0);
        return;
      }
    } else {
      await this.showTransitionText(checkpointConstants.checkpointText);
      await callGameManagerOnTxtLoad(this, chapterDetails, false, currChapter, currCheckpoint + 1);
      return;
    }
  }

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

    this.tweens.add({
      targets: transitionText,
      ...checkpointConstants.entryTween
    });

    await sleep(checkpointConstants.tweenDuration * 2);

    this.tweens.add({
      targets: transitionText,
      ...checkpointConstants.exitTween
    });

    await sleep(checkpointConstants.tweenDuration);
  }

  private async saveChapterComplete(loadedGameState: FullSaveState, currChapter: number) {
    loadedGameState.userSaveState.lastCompletedChapter = Math.max(
      loadedGameState.userSaveState.lastCompletedChapter,
      currChapter
    );
    await saveData(loadedGameState);
  }

  private isLastCheckpoint(
    chapterDetails: GameChapter[],
    currChapter: number,
    currCheckpoint: number
  ) {
    return currCheckpoint >= chapterDetails[currChapter].filenames.length - 1;
  }
}

export default CheckpointTransition;
