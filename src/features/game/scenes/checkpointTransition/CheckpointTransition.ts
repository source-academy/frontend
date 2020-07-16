import {
  AccountInfo,
  getSourceAcademyGame
} from 'src/pages/academy/game/subcomponents/sourceAcademyGame';

import { GameChapter } from '../../chapter/GameChapterTypes';
import { screenCenter } from '../../commons/CommonConstants';
import { loadData, saveData } from '../../save/GameSaveRequests';
import { FullSaveState } from '../../save/GameSaveTypes';
import GameSoundManager from '../../sound/GameSoundManager';
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
  private soundManager: GameSoundManager;

  constructor() {
    super('CheckpointTransition');
    this.soundManager = new GameSoundManager();
  }

  public preload() {
    this.soundManager.initialise(this, getSourceAcademyGame());
  }

  public async create() {
    const accountInfo = getSourceAcademyGame().getAccountInfo();
    const loadedGameState = await loadData(accountInfo);
    const chapterDetails = SampleChapters; // TODO: Fetch from backend

    const [currChapter, currCheckpoint] = loadedGameState.userState.lastPlayedCheckpoint;

    if (this.isLastCheckpoint(chapterDetails, currChapter, currCheckpoint)) {
      await this.saveChapterComplete(loadedGameState, accountInfo, currChapter);
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

  private async saveChapterComplete(
    loadedGameState: FullSaveState,
    accountInfo: AccountInfo,
    currChapter: number
  ) {
    loadedGameState.userState.lastCompletedChapter = Math.max(
      loadedGameState.userState.lastCompletedChapter,
      currChapter
    );
    await saveData(accountInfo, loadedGameState);
  }

  private isLastCheckpoint(
    chapterDetails: GameChapter[],
    currChapter: number,
    currCheckpoint: number
  ) {
    return currCheckpoint >= chapterDetails[currChapter].checkpointsFilenames.length - 1;
  }
}

export default CheckpointTransition;
