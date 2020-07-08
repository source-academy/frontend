import * as React from 'react';
import { Menu, MenuItem, Position, Popover, Button, InputGroup } from '@blueprintjs/core';

import { uploadAssets, s3AssetFolders } from 'src/features/storySimulator/StorySimulatorService';

type Props = {
  accessToken?: string;
};

function AssetFileUploader({ accessToken }: Props) {
  const [fileList, setFileList] = React.useState<FileList>();
  const [folder, setFolder] = React.useState<string>('locations');

  const [showfolderOverwrite, setShowFolderOverwrite] = React.useState<boolean>(false);
  const [folderOverwrite, setFolderOverwrite] = React.useState<string>();

  function onLoadFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const loadedFiles = e.target.files;
    setFileList(loadedFiles);
  }

  async function onUploadButtonClick() {
    const finalFolder = folderOverwrite || folder;
    if (!accessToken || !fileList || !finalFolder) return;
    const resp = await uploadAssets(accessToken, fileList, finalFolder, ['image', 'audio', 'text']);
    alert(resp);
  }

  function onChangeFolder(e: any) {
    if (!e.target.innerText) return;
    setFolder(e.target.innerText);
    setShowFolderOverwrite(false);
  }

  function onChangeFolderOverwrite(e: any) {
    setFolderOverwrite(e.target.value);
  }

  function showSpecifyFolder(e: any) {
    if (!e.target.innerText) return;
    setFolder(e.target.innerText);
    setShowFolderOverwrite(true);
  }

  const folderDropDown = (
    <>
      <Menu>
        {s3AssetFolders.map(folder => (
          <MenuItem onClick={onChangeFolder} id={folder} key={folder} text={folder} />
        ))}
        <MenuItem
          onClick={showSpecifyFolder}
          id={'specify'}
          key={'specify'}
          text={'...Specify own folder'}
        ></MenuItem>
      </Menu>
    </>
  );

  return (
    <div className="LeftAlign">
      <h4>Choose Folder</h4>
      <Popover content={folderDropDown} position={Position.BOTTOM}>
        <Button text={folder} />
      </Popover>
      {showfolderOverwrite && (
        <InputGroup
          placeholder="Or specify your own, e.g. 'locations/hallway'"
          onChange={onChangeFolderOverwrite}
        />
      )}
      <br />
      <h4>Choose File</h4>
      <input type="file" multiple id="id" onChange={onLoadFile} style={{ width: '250px' }} />
      <Button onClick={onUploadButtonClick}>Upload</Button>
    </div>
  );
}

export default AssetFileUploader;
