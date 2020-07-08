import { loadData, saveData } from '../../save/GameSaveRequests';
import {
  getSourceAcademyGame,
  AccountInfo
} from 'src/pages/academy/game/subcomponents/sourceAcademyGame';
import { SampleChapters } from '../chapterSelect/SampleChapters';
import { callGameManagerOnTxtLoad } from '../../utils/TxtLoaderUtils';
import { GameChapter } from '../../chapter/GameChapterTypes';
import { FullSaveState } from '../../save/GameSaveTypes';
import {
  chapterTransitionText,
  checkpointTransitionText,
  transitionTextStyle,
  transitionEntryTween,
  transitionExitTween,
  transitionDuration
} from './CheckpointConstants';
import { sleep } from '../../utils/GameUtils';
import { screenCenter } from '../../commons/CommonConstants';

class CheckpointTransition extends Phaser.Scene {
  constructor() {
    super('CheckpointTransition');
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
        await this.showTransitionText(chapterTransitionText);
        await callGameManagerOnTxtLoad(this, chapterDetails, true, currChapter + 1, 0);
        return;
      }
    } else {
      await this.showTransitionText(checkpointTransitionText);
      await callGameManagerOnTxtLoad(this, chapterDetails, false, currChapter, currCheckpoint + 1);
      return;
    }
  }

  private async showTransitionText(text: string) {
    const transitionText = new Phaser.GameObjects.BitmapText(
      this,
      screenCenter.x,
      screenCenter.y,
      transitionTextStyle.key,
      text,
      transitionTextStyle.size,
      transitionTextStyle.align
    ).setTintFill(transitionTextStyle.fill);

    this.add.existing(transitionText);

    transitionText.setOrigin(0.5, 0.5);
    transitionText.setAlpha(0);

    this.tweens.add({
      targets: transitionText,
      ...transitionEntryTween
    });

    await sleep(transitionDuration * 2);

    this.tweens.add({
      targets: transitionText,
      ...transitionExitTween
    });

    await sleep(transitionDuration);
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
