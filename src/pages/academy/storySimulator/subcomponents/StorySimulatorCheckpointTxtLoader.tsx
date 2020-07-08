import * as React from 'react';
import 'ace-builds/webpack-resolver';
import { Tabs, Tab, Button, Popover, MenuItem, Menu, Position } from '@blueprintjs/core';
import { Constants } from 'src/features/game/commons/CommonConstants';

type Props = {
  useDefaultChapter: boolean;
  storageName: string;
  accessToken?: string;
  assetPaths: string[];
};

function CheckpointTxtLoader({ storageName, assetPaths, useDefaultChapter }: Props) {
  const textAssets = assetPaths
    .filter(assetPath => assetPath.startsWith('stories') && assetPath.endsWith('txt'))
    .map(
      assetPath => assetPath.slice(8) // remove /stories
    );

  const [filename, setFilename] = React.useState(
    useDefaultChapter ? 'defaultCheckpoint.txt' : textAssets[0]
  );

  function onLoadTxt(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const [file] = e.target.files;
    loadFileLocally(storageName, file);
  }

  async function changeChosenFilename(e: any) {
    if (!e.target.innerHTML) return;

    const filename = e.target.innerHTML;

    setFilename('Loading');
    const response = await fetch(`${Constants.assetsFolder}/stories/${filename}`);
    const txt = await response.text();

    setFilename(filename);
    sessionStorage.setItem(storageName, txt);
  }

  const uploadButton = (
    <div>
      <input type="file" onChange={onLoadTxt} style={{ width: '250px' }} />
    </div>
  );

  const s3DropDown = (
    <>
      <Menu>
        {textAssets.map(file => (
          <MenuItem onClick={changeChosenFilename} id={file} key={file} text={file} />
        ))}
      </Menu>
    </>
  );

  const chooseS3Txt = (
    <>
      <Popover content={s3DropDown} position={Position.BOTTOM}>
        <Button text={filename} />
      </Popover>
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
