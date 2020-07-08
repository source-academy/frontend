import * as React from 'react';
import { Button } from '@blueprintjs/core';

import { gameTxtStorageName } from 'src/features/storySimulator/scenes/mainMenu/MainMenuConstants';
import CheckpointTxtLoader from './StorySimulatorCheckpointTxtLoader';

type Props = {
  accessToken?: string;
};

export default function CheckpointSim({ accessToken }: Props) {
  return (
    <>
      <h3>Checkpoint Text Loader</h3>
      <CheckpointTxtLoader
        title={'Step 1: Choose default checkpoint'}
        storageName={gameTxtStorageName.defaultChapter}
        accessToken={accessToken}
      />
      <br />
      <CheckpointTxtLoader
        title={'Step 2: Choose checkpoint text'}
        storageName={gameTxtStorageName.checkpointTxt}
        accessToken={accessToken}
      />
      <br />
      <Button onClick={() => {}} icon="play">
        Simulate Checkpoint
      </Button>
      <br />
      <br />
    </>
  );
}
