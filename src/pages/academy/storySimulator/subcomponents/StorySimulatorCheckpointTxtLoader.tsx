import 'ace-builds/webpack-resolver';

import { Button, Tab, Tabs } from '@blueprintjs/core';
import React from 'react';
import { toTxtPath } from 'src/features/game/assets/TextAssets';
import { toS3Path } from 'src/features/game/utils/GameUtils';

type Props = {
  storageName: string;
  s3TxtFiles: string[];
};

/**
 * This component enables story writers to upload their txt file contents
 * to the browser, or load a file from S3 and store the txt contents
 * in the browser. So that GameManager can read from these txt files
 *
 * @param storageName the field in browser storage where the loaded/fetched txt files get stored temporarily
 * @param s3TxtFiles the list of S3 txt files to choose from
 */
function CheckpointTxtLoader({ storageName, s3TxtFiles }: Props) {
  const [chosenFilename, setChosenFilename] = React.useState(s3TxtFiles[0]);

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
      <select className="bp4-menu" onChange={changeChosenFilename}>
        {s3TxtFiles.map(file => (
          <option value={file} key={file}>
            {file}
          </option>
        ))}
      </select>
      <Button icon={'download'} onClick={() => window.open(toTxtPath(chosenFilename))} />
    </>
  );

  return (
    <div className="LeftAlign">
      <hr />
      <Tabs id="Tabs" key="vertical" renderActiveTabPanelOnly={true}>
        <Tab id="own" title="Local" panel={uploadButton} />
        <Tab id="s3" title="S3" panel={chooseS3Txt} />
      </Tabs>
      <hr />
    </div>
  );
}

const loadFileLocally = (storageName: string, txtFile: File) => {
  const reader = new FileReader();
  reader.readAsText(txtFile);
  reader.onloadend = _ => {
    if (!reader.result) {
      return;
    }
    sessionStorage.setItem(storageName, reader.result.toString());
  };
};

export default CheckpointTxtLoader;

function createHeadersWithCors(): Headers {
  const headers = new Headers();
  headers.append('Access-Control-Allow-Origin', '*');
  return headers;
}
