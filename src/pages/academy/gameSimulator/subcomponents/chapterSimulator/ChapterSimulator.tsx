import { Button } from '@blueprintjs/core';
import { useRequest } from 'src/commons/utils/Hooks';
import SourceAcademyGame from 'src/features/game/SourceAcademyGame';
import { gameSimulatorMenuConstants } from 'src/features/gameSimulator/GameSimulatorConstants';
import GameSimulatorMenu from 'src/features/gameSimulator/GameSimulatorMenu';
import { fetchTextAssets } from 'src/features/gameSimulator/GameSimulatorService';

import ChapterSimulatorTextLoader from './ChapterSimulatorTextLoader';

/**
 * This component renders the Chapter Simulator component in the Game Simulator.
 *
 * It will simulate a game chapter using the given text files (from either S3 or Local).
 *
 * @param textAssets List of all text assets on S3 to choose from.
 */
const ChapterSimulator: React.FC = () => {
  const { value: textAssets } = useRequest<string[]>(fetchTextAssets, []);

  function simulateCheckpoint() {
    (
      SourceAcademyGame.getInstance().getCurrentSceneRef() as GameSimulatorMenu
    ).simulateCheckpoint();
  }

  function clearSessionStorage(e: any) {
    sessionStorage.setItem(gameSimulatorMenuConstants.gameTxtStorageName.checkpointTxt, '');
    sessionStorage.setItem(gameSimulatorMenuConstants.gameTxtStorageName.defaultChapter, '');
  }

  return (
    <>
      <h3>Simulate Chapters</h3>
      <b>Choose the Main Chapter file:</b>
      <ChapterSimulatorTextLoader
        s3TxtFiles={textAssets}
        storageName={gameSimulatorMenuConstants.gameTxtStorageName.checkpointTxt}
      />
      <br />
      <br />
      <b>Choose a Default Variables ("Default Checkpoint") file (Optional):</b>
      <ChapterSimulatorTextLoader
        s3TxtFiles={textAssets}
        storageName={gameSimulatorMenuConstants.gameTxtStorageName.defaultChapter}
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
