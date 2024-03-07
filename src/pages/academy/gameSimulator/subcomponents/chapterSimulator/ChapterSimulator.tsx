import { Button } from '@blueprintjs/core';
import { useRequest } from 'src/commons/utils/Hooks';
import SourceAcademyGame from 'src/features/game/SourceAcademyGame';
import { fetchTextAssets } from 'src/features/gameSimulator/GameSimulatorService';
import MainMenu from 'src/features/gameSimulator/scenes/MainMenu';
import mainMenuConstants from 'src/features/gameSimulator/scenes/MainMenuConstants';

import ChapterSimulatorTextLoader from './ChapterSimulatorTextLoader';

/**
 * This component renders the Chapter Simulator component.
 *
 * It will simulate a game chapter using the given text files (from either S3 or Local).
 *
 * @param textAssets List of all text assets on S3 to choose from.
 */
const ChapterSimulator = () => {
  const { value: textAssets } = useRequest<string[]>(fetchTextAssets, []);

  function simulateCheckpoint() {
    (SourceAcademyGame.getInstance().getCurrentSceneRef() as MainMenu).simulateCheckpoint();
  }

  function clearSessionStorage(e: any) {
    sessionStorage.setItem(mainMenuConstants.gameTxtStorageName.checkpointTxt, '');
    sessionStorage.setItem(mainMenuConstants.gameTxtStorageName.defaultChapter, '');
  }

  return (
    <>
      <h3>Simulate Chapters</h3>
      <b>Choose the Main Chapter file:</b>
      <ChapterSimulatorTextLoader
        s3TxtFiles={textAssets}
        storageName={mainMenuConstants.gameTxtStorageName.checkpointTxt}
      />
      <br />
      <br />
      <b>Choose a Default Variables ("Default Checkpoint") file (Optional):</b>
      <ChapterSimulatorTextLoader
        s3TxtFiles={textAssets}
        storageName={mainMenuConstants.gameTxtStorageName.defaultChapter}
      />
      <br />
      <hr />
      <br />
      <Button onClick={simulateCheckpoint} icon="play">
        Simulate Chapter
      </Button>
      <br />
      <br />
      <Button onClick={clearSessionStorage}>Reset All Files</Button>
      <br />
    </>
  );
};

export default ChapterSimulator;
