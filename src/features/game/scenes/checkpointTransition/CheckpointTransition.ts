import { loadData, saveData } from '../../save/GameSaveRequests';
import { getSourceAcademyGame } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';
import { SampleChapters } from '../chapterSelect/SampleChapters';
import { callGameManagerOnTxtLoad } from '../../utils/TxtLoaderUtils';

class CheckpointTransition extends Phaser.Scene {
  constructor() {
    super('CheckpointTransition');
  }

  public async create() {
    const accountInfo = getSourceAcademyGame().getAccountInfo();
    const loadedGameState = await loadData(accountInfo);
    const chapterDetails = SampleChapters; // TODO: Fetch from backend

    const [currChapter, currCheckpoint] = loadedGameState.userState.lastPlayedCheckpoint;

    const nextChapter = currChapter;
    let nextCheckpoint = currChapter;
    if (currCheckpoint >= chapterDetails[currChapter].checkpointsFilenames.length - 1) {
      loadedGameState.userState.lastCompletedChapter = Math.max(
        loadedGameState.userState.lastCompletedChapter,
        currChapter
      );
      await saveData(accountInfo, loadedGameState);

      this.scene.start('ChapterSelect');
    } else {
      nextCheckpoint++;
      const filename = chapterDetails[nextChapter].checkpointsFilenames[nextCheckpoint];
      callGameManagerOnTxtLoad(this, filename, false, nextChapter, nextCheckpoint);
    }
  }
}

export default CheckpointTransition;
