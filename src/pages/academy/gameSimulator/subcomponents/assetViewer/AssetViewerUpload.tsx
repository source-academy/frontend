import { Button, InputGroup, Menu, MenuItem, Popover, Position } from '@blueprintjs/core';
import React, { useState } from 'react';
import { s3AssetFolders, uploadAssetsToS3 } from 'src/features/gameSimulator/GameSimulatorService';

/**
 * This component allows uploading of new assets into the S3 asset files.
 */
const AssetViewerUpload: React.FC = () => {
  const [fileList, setFileList] = useState<FileList>();
  const [uploadFolder, setUploadFolder] = useState<string>(s3AssetFolders[0]);

  const [folderOverwrite, setFolderOverwrite] = useState<string>();
  const [showfolderOverwrite, setShowFolderOverwrite] = useState(false);

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

  const uploadButtonPopoverContent = (
    <Menu>
      {s3AssetFolders.map(folder => (
        <MenuItem onClick={handleChangeUploadFolder} id={folder} key={folder} text={folder} />
      ))}
      <MenuItem onClick={showSpecifyFolder} text="Custom Folder"></MenuItem>
    </Menu>
  );
  return (
    <div className="LeftAlign">
      <h4>Choose a Folder to upload an asset to:</h4>
      <Popover placement={Position.BOTTOM} content={uploadButtonPopoverContent}>
        <Button text={uploadFolder} />
      </Popover>
      <br />
      <br />
      {showfolderOverwrite && (
        <InputGroup
          placeholder="Specify your own custom folder: e.g. 'locations/hallway'"
          onChange={handleChangeFolderOverwrite}
        />
      )}
      <h4>Choose the asset File to be uploaded:</h4>
      <input type="file" multiple onChange={handleLoadFile} />
      <Button onClick={handleUploadButtonClick}>Upload</Button>
    </div>
  );
};

export default AssetViewerUpload;
