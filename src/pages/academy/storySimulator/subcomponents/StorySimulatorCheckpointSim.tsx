import { Button } from '@blueprintjs/core';
import React from 'react';
import SourceAcademyGame from 'src/features/game/SourceAcademyGame';
import MainMenu from 'src/features/storySimulator/scenes/mainMenu/MainMenu';
import mainMenuConstants from 'src/features/storySimulator/scenes/mainMenu/MainMenuConstants';

import CheckpointTxtLoader from './StorySimulatorCheckpointTxtLoader';

type Props = {
  textAssets: string[];
};

export default function CheckpointSim({ textAssets }: Props) {
  function simulateCheckpoint() {
    (SourceAcademyGame.getInstance().getCurrentSceneRef() as MainMenu).simulateCheckpoint();
  }

  return (
    <>
      <h3>Checkpoint Text Loader</h3>
      <b>Step 1: Choose default checkpoint</b>
      <CheckpointTxtLoader
        textAssets={textAssets}
        storageName={mainMenuConstants.gameTxtStorageName.defaultChapter}
      />
      <b>Step 2: Choose checkpoint text</b>
      <CheckpointTxtLoader
        textAssets={textAssets}
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
