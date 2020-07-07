import * as React from 'react';
import _ from 'lodash';
import { Menu, MenuItem, Position, Popover, Button } from '@blueprintjs/core';

import { uploadAssets, s3AssetFolders } from 'src/features/storySimulator/StorySimulatorService';

type Props = {
  accessToken?: string;
};

function AssetFileUploader({ accessToken }: Props) {
  const [fileList, setFileList] = React.useState<FileList>();
  const [folder, setFolder] = React.useState<string>();

  function onLoadFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const loadedFiles = e.target.files;
    setFileList(loadedFiles);
  }

  async function onUploadButtonClick() {
    if (!accessToken || !fileList || !folder) return;
    const resp = await uploadAssets(accessToken, fileList, folder);
    alert(resp);
  }

  function onChangeFolder(e: any) {
    if (!e.target.innerText) return;
    setFolder(e.target.innerText.toLowerCase());
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
        <Button text={_.capitalize(folder) || 'Choose Folder...'} />
      </Popover>
      <br />
      <input type="file" multiple id="id" onChange={onLoadFile} style={{ width: '250px' }} />
      <br />
      <Button onClick={onUploadButtonClick}>Upload</Button>
    </div>
  );
}

export default AssetFileUploader;
