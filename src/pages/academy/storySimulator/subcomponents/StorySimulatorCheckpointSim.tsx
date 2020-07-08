import * as React from 'react';
import { Button } from '@blueprintjs/core';

import { gameTxtStorageName } from 'src/features/storySimulator/scenes/mainMenu/MainMenuConstants';
import CheckpointTxtLoader from './StorySimulatorCheckpointTxtLoader';
import { getStorySimulatorGame } from './storySimulatorGame';

type Props = {
  accessToken?: string;
  assetPaths: string[];
};

export default function CheckpointSim({ accessToken, assetPaths }: Props) {
  function simulateCheckpoint() {
    getStorySimulatorGame().getStorySimProps('currentScene').callGameManager();
  }

  return (
    <>
      <h3>Checkpoint Text Loader</h3>
      <b>Step 1: Choose default checkpoint</b>
      <CheckpointTxtLoader
        assetPaths={assetPaths}
        useDefaultChapter={true}
        storageName={gameTxtStorageName.defaultChapter}
        accessToken={accessToken}
      />
      <b>Step 2: Choose checkpoint text</b>
      <CheckpointTxtLoader
        assetPaths={assetPaths}
        useDefaultChapter={false}
        storageName={gameTxtStorageName.checkpointTxt}
        accessToken={accessToken}
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
  sessionStorage.setItem(gameTxtStorageName.checkpointTxt, '');
  sessionStorage.setItem(gameTxtStorageName.defaultChapter, '');
}
