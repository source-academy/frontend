import 'ace-builds/webpack-resolver';

import { Button, Tab, Tabs } from '@blueprintjs/core';
import React from 'react';
import { toTxtPath } from 'src/features/game/assets/TextAssets';
import { Constants } from 'src/features/game/commons/CommonConstants';

type Props = {
  storageName: string;
  textAssets: string[];
};

function CheckpointTxtLoader({ storageName, textAssets }: Props) {
  const [chosenFilename, setChosenFilename] = React.useState('');

  function onLoadTxt(e: any) {
    if (!e.target.files) return;
    const [file] = e.target.files;
    loadFileLocally(storageName, file);
  }

  async function changeChosenFilename(e: any) {
    const filename = e.target.value;
    setChosenFilename(filename);
    const response = await fetch(`${Constants.assetsFolder}/stories/${filename}`);
    const txt = await response.text();
    sessionStorage.setItem(storageName, txt);
  }

  const uploadButton = <input type="file" onChange={onLoadTxt} style={{ width: '250px' }} />;

  const chooseS3Txt = (
    <>
      <select className="bp3-menu" onChange={changeChosenFilename}>
        {textAssets.map(file => (
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
      <Tabs id="Tabs" key={'vertical'} renderActiveTabPanelOnly={true}>
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
