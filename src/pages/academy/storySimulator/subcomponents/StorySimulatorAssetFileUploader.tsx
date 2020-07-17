import { Button, InputGroup, Menu, MenuItem, Popover, Position } from '@blueprintjs/core';
import * as React from 'react';
import { s3AssetFolders, uploadAssets } from 'src/features/storySimulator/StorySimulatorService';

type Props = {
  accessToken?: string;
};

const specifyFolderText = 'Specify own folder...';
const folderOverwritePlaceholder = "Or specify your own, e.g. 'locations/hallway'";

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
    const resp = await uploadAssets(accessToken, fileList, finalFolder);
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

  return (
    <div className="LeftAlign">
      <h4>Choose Folder</h4>
      <Popover position={Position.BOTTOM}>
        <Button text={folder} />
        <Menu>
          {s3AssetFolders.map(folder => (
            <MenuItem onClick={onChangeFolder} id={folder} key={folder} text={folder} />
          ))}
          <MenuItem
            onClick={showSpecifyFolder}
            id={specifyFolderText}
            key={specifyFolderText}
            text={specifyFolderText}
          ></MenuItem>
        </Menu>
      </Popover>
      {showfolderOverwrite && (
        <InputGroup placeholder={folderOverwritePlaceholder} onChange={onChangeFolderOverwrite} />
      )}
      <br />
      <h4>Choose File</h4>
      <input type="file" multiple onChange={onLoadFile} />
      <Button onClick={onUploadButtonClick}>Upload</Button>
    </div>
  );
}

export default AssetFileUploader;
