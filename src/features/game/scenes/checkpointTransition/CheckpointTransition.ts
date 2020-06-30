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
    const loadedGameState = await loadData(accountInfo);
    const chapterDetails = SampleChapters; // TODO: Fetch from backend

    this.getNextChapter(loadedGameState, chapterDetails);
  }

  private getNextChapter(fullState: FullSaveState, chapterDetails: GameChapter[]): void {
    const [currChapter, currCheckpoint] = fullState.userState.lastPlayedCheckpoint;

    const nextChapter = currChapter;
    let nextCheckpoint = currChapter;
    if (currCheckpoint >= chapterDetails[currChapter].checkpointsFilenames.length - 1) {
      this.scene.start('ChapterSelect');
    } else {
      nextCheckpoint++;
      const filename = chapterDetails[nextChapter].checkpointsFilenames[nextCheckpoint];
      callGameManagerOnTxtLoad(this, filename, false, nextChapter, nextCheckpoint);
    }
  }
}

export default CheckpointTransition;
