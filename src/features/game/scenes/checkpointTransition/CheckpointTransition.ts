import { addLoadingScreen } from '../../effects/LoadingScreen';
import { loadData } from '../../save/GameSaveRequests';
import { getSourceAcademyGame } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';
import { SampleChapters } from '../chapterSelect/SampleChapters';
import { GameChapter } from '../../chapter/GameChapterTypes';
import { FullSaveState } from '../../save/GameSaveTypes';
import { callGameManagerOnTxtLoad } from '../../utils/TxtLoaderUtils';

class CheckpointTransition extends Phaser.Scene {
  constructor() {
    super('CheckpointTransition');
  }

  public async preload() {
    addLoadingScreen(this);
    const accountInfo = getSourceAcademyGame().getAccountInfo();
    if (!accountInfo) {
      console.log('No account info');
      return;
    }
    const loadedGameState = await loadData(accountInfo);
    const chapterDetails = SampleChapters; // TODO: Fetch from backend
    const [nextChapterNum, nextCheckpointNum, nextCheckpointFileName] = this.getNextChapter(
      loadedGameState,
      chapterDetails
    );
    callGameManagerOnTxtLoad(
      this,
      nextCheckpointFileName,
      false,
      nextChapterNum,
      nextCheckpointNum
    );
  }

  private getNextChapter(
    fullState: FullSaveState,
    chapterDetails: GameChapter[]
  ): [number, number, string] {
    const [currChapter, currCheckpoint] = fullState.userState.lastPlayedCheckpoint;

    let nextChapter = currChapter;
    let nextCheckpoint = currChapter;
    if (currCheckpoint >= chapterDetails[currChapter].checkpointsFilenames.length - 1) {
      nextCheckpoint = 0;
      if (nextChapter < chapterDetails.length - 1) nextChapter++;
      else {
        // Last chapter is played, bring to main menu
        this.scene.start('MainMenu');
      }
    } else {
      nextCheckpoint++;
    }

    const filename = chapterDetails[nextChapter].checkpointsFilenames[nextCheckpoint];
    return [nextChapter, nextCheckpoint, filename];
  }
}

export default CheckpointTransition;
