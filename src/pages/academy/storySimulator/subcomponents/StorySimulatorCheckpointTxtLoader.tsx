import * as React from 'react';
import 'ace-builds/webpack-resolver';
import { Tabs, Tab, Button, Popover, MenuItem, Menu, Position } from '@blueprintjs/core';

type Props = {
  title: string;
  storageName: string;
  accessToken?: string;
};

function CheckpointTxtLoader({ title, storageName, accessToken }: Props) {
  function onLoadTxt(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const [file] = e.target.files;

    loadFileLocally(storageName, file);
  }

  function clearSessionStorage(e: any) {
    sessionStorage.setItem(storageName, '');
  }

  const uploadButton = (
    <div>
      <input type="file" onChange={onLoadTxt} style={{ width: '250px' }} />
      <Button onClick={clearSessionStorage}>Reset</Button>
    </div>
  );

  const s3DropDown = (
    <>
      <Menu>
        {['chapter0.0.txt', 'chapter0.1.txt'].map(folder => (
          <MenuItem onClick={(e: any) => {}} id={folder} key={folder} text={folder} />
        ))}
      </Menu>
    </>
  );

  const chooseS3Txt = (
    <Popover content={s3DropDown} position={Position.BOTTOM}>
      <Button text={'S3 txt'} />
    </Popover>
  );

  return (
    <div className="LeftAlign">
      <b>{title}</b>
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
