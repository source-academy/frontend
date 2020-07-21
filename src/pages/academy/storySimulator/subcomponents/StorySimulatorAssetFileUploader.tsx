import { Button, InputGroup, Menu, MenuItem, Popover, Position } from '@blueprintjs/core';
import React from 'react';
import {
  s3AssetFolders,
  uploadAssetsToS3
} from 'src/features/storySimulator/StorySimulatorService';

const specifyFolderText = 'Specify own folder...';
const folderOverwritePlaceholder = "Or specify your own, e.g. 'locations/hallway'";

/**
 * This is component allows storywriters to upload any assets into to
 * specific folders into Story Sim's Asset Uploader
 */
const AssetFileUploader = () => {
  const [fileList, setFileList] = React.useState<FileList>();
  const [uploadFolder, setUploadFolder] = React.useState<string>(s3AssetFolders[0]);

  const [folderOverwrite, setFolderOverwrite] = React.useState<string>();
  const [showfolderOverwrite, setShowFolderOverwrite] = React.useState<boolean>(false);

  function handleLoadFile(e: any) {
    if (!e.target.files) return;
    const loadedFiles = e.target.files;
    setFileList(loadedFiles);
  }

  async function handleUploadButtonClick() {
    const finalFolder = folderOverwrite || uploadFolder;
    if (!fileList || !finalFolder) return;
    const response = await uploadAssetsToS3(fileList, finalFolder);
    alert(response);
  }

  function handleChangeUploadFolder(e: any) {
    if (!e.target.innerText) return;
    setUploadFolder(e.target.innerText);
    setShowFolderOverwrite(false);
  }

  function handleChangeFolderOverwrite(e: any) {
    setFolderOverwrite(e.target.value);
  }

  function showSpecifyFolder(e: any) {
    if (!e.target.innerText) return;
    setUploadFolder(e.target.innerText);
    setShowFolderOverwrite(true);
  }

  return (
    <div className="LeftAlign">
      <h4>Choose Folder</h4>
      <Popover position={Position.BOTTOM}>
        <Button text={uploadFolder} />
        <Menu>
          {s3AssetFolders.map(folder => (
            <MenuItem onClick={handleChangeUploadFolder} id={folder} key={folder} text={folder} />
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
        <InputGroup
          placeholder={folderOverwritePlaceholder}
          onChange={handleChangeFolderOverwrite}
        />
      )}
      <br />
      <h4>Choose File</h4>
      <input type="file" multiple onChange={handleLoadFile} />
      <Button onClick={handleUploadButtonClick}>Upload</Button>
    </div>
  );
};

export default AssetFileUploader;
