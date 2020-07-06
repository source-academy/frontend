import * as React from 'react';
import _ from 'lodash';

import { uploadAsset, s3AssetFolders } from 'src/features/storySimulator/StorySimulatorService';
import { Menu, MenuItem, Position, Popover, Button } from '@blueprintjs/core';

type Props = {
  accessToken?: string;
};

function AssetFileUploader({ accessToken }: Props) {
  const [file, setFile] = React.useState<[File, string]>();
  const [folder, setFolder] = React.useState<string>('Choose folder...');

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fakePath =
      document && document.getElementById('id') && (document.getElementById('id')! as any).value;
    const fileName = fakePath.split('\\').pop();
    if (!e.target.files) return;
    const [uploadedFile] = e.target.files;
    setFile([uploadedFile, fileName]);
  }

  function onClick() {
    if (!accessToken || !file) return;
    const [blob, fileName] = file;
    uploadAsset(accessToken, blob, 'ui', fileName);
  }
  function onChangeFolder(e: any) {
    if (!e.target.innerText) {
      return;
    }
    setFolder(e.target.innerText.toLowerCase() || 'Choose folder...');
  }

  const dropDown = (
    <>
      <Menu onClick={onChangeFolder}>
        {s3AssetFolders.map(folder => (
          <MenuItem onClick={onChangeFolder} id={folder} key={folder} text={_.capitalize(folder)} />
        ))}
      </Menu>
    </>
  );

  return (
    <div className="LeftAlign">
      <Popover content={dropDown} position={Position.BOTTOM}>
        <Button style={{ width: '100%' }} text={_.capitalize(folder)} />
      </Popover>
      <br />
      <input type="file" id="id" onChange={onChange} style={{ width: '250px' }} />
      <br />
      <Button onClick={onClick}>Upload</Button>
    </div>
  );
}

export default AssetFileUploader;
