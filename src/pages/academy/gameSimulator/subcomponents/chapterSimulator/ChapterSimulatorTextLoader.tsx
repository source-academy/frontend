import 'ace-builds/webpack-resolver';

import { Button, Classes, Tab, Tabs } from '@blueprintjs/core';
import { useState } from 'react';
import { toTxtPath } from 'src/features/game/assets/TextAssets';
import { toS3Path } from 'src/features/game/utils/GameUtils';
import { StorageProps } from 'src/features/gameSimulator/GameSimulatorTypes';
import {
  createHeadersWithCors,
  loadFileLocally
} from 'src/features/gameSimulator/GameSimulatorUtils';

/**
 * This component allows chapter text files to be loaded either from S3, or from the user's local device.
 *
 * @param storageName The field within browser storage to temporarily store the loaded / fetched text file(s).
 * @param s3TxtFiles List of all text assets on S3 to choose from.
 */
const ChapterSimulatorTextLoader: React.FC<StorageProps> = ({ storageName, s3TxtFiles }) => {
  const [chosenFilename, setChosenFilename] = useState(s3TxtFiles[0]);

  function onLoadTxt(e: any) {
    if (!e.target.files) return;
    const [file] = e.target.files;
    loadFileLocally(storageName, file);
  }

  async function changeChosenFilename(e: any) {
    const filename = e.target.value;
    setChosenFilename(filename);
    const response = await fetch(toS3Path(`/stories/${filename}`, true), {
      headers: createHeadersWithCors()
    });
    const txt = await response.text();
    sessionStorage.setItem(storageName, txt);
  }

  const uploadButton = <input type="file" onChange={onLoadTxt} style={{ width: '250px' }} />;

  const chooseS3Txt = (
    <>
      <select className={Classes.MENU} onChange={changeChosenFilename}>
        {s3TxtFiles.map(file => (
          <option value={file} key={file}>
            {file}
          </option>
        ))}
      </select>
      <Button icon="download" onClick={() => window.open(toTxtPath(chosenFilename))} />
    </>
  );

  return (
    <div className="LeftAlign">
      <hr />
      <Tabs id="Tabs" key="vertical" renderActiveTabPanelOnly={true}>
        <Tab id="own" title="Local" panel={uploadButton} />
        <Tab id="s3" title="S3" panel={chooseS3Txt} />
      </Tabs>
    </div>
  );
};

export default ChapterSimulatorTextLoader;
