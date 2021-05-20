import { Button } from '@blueprintjs/core';
import { useRequest } from 'src/commons/utils/Hooks';
import SourceAcademyGame from 'src/features/game/SourceAcademyGame';
import MainMenu from 'src/features/storySimulator/scenes/mainMenu/MainMenu';
import mainMenuConstants from 'src/features/storySimulator/scenes/mainMenu/MainMenuConstants';
import { fetchTextAssets } from 'src/features/storySimulator/StorySimulatorService';

import CheckpointTxtLoader from './StorySimulatorCheckpointTxtLoader';

/**
 * This component helps one simulate a checkpoint by
 * supplying two txt files - the default txt file
 * and the checkpoint txt file
 *
 * @param textAssets these are the list of text files on S3, if storywriter's simulation
 *                   involves S3 text files.
 */
export default function CheckpointSim() {
  const { value: textAssets } = useRequest<string[]>(fetchTextAssets, []);

  function simulateCheckpoint() {
    (SourceAcademyGame.getInstance().getCurrentSceneRef() as MainMenu).simulateCheckpoint();
  }

  return (
    <>
      <h3>Checkpoint Text Loader</h3>
      <b>Step 1: Choose default checkpoint</b>
      <CheckpointTxtLoader
        s3TxtFiles={textAssets}
        storageName={mainMenuConstants.gameTxtStorageName.defaultChapter}
      />
      <b>Step 2: Choose checkpoint text</b>
      <CheckpointTxtLoader
        s3TxtFiles={textAssets}
        storageName={mainMenuConstants.gameTxtStorageName.checkpointTxt}
      />
      <br />
      <Button onClick={simulateCheckpoint} icon="play">
        Simulate Checkpoint
      </Button>
      <br />
      <br />
      <Button onClick={clearSessionStorage}>Reset All Files</Button>
      <br />
    </>
  );
}

function clearSessionStorage(e: any) {
  sessionStorage.setItem(mainMenuConstants.gameTxtStorageName.checkpointTxt, '');
  sessionStorage.setItem(mainMenuConstants.gameTxtStorageName.defaultChapter, '');
}
