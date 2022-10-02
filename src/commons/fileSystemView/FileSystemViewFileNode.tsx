import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { FSModule } from 'browserfs/dist/node/core/FS';
import path from 'path';
import React from 'react';

import FileSystemViewContextMenu from './FileSystemViewContextMenu';

export type FileSystemViewFileNodeProps = {
  fileSystem: FSModule;
  basePath: string;
  fileName: string;
  refreshDirectory: () => void;
};

const FileSystemViewFileNode: React.FC<FileSystemViewFileNodeProps> = (
  props: FileSystemViewFileNodeProps
) => {
  const { fileSystem, basePath, fileName, refreshDirectory } = props;

  const [editedFileName, setEditedFileName] = React.useState<string>(fileName);
  const [isEditing, setIsEditing] = React.useState<boolean>(false);

  const handleRenameFile = () => setIsEditing(true);
  const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEditedFileName(e.target.value);
  const handleInputOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);

      const oldPath = path.join(basePath, fileName);
      const newPath = path.join(basePath, editedFileName);
      if (oldPath === newPath) {
        return;
      }

      // Check whether the new path already exists to prevent overwriting of existing files & directories.
      fileSystem.exists(newPath, newPathExists => {
        if (newPathExists) {
          setEditedFileName(fileName);
          // TODO: Implement modal that informs the user that the path already exists.
          return;
        }

        fileSystem.rename(oldPath, newPath, err => {
          if (err) {
            console.error(err);
          }
          refreshDirectory();
        });
      });
    }
  };
  const handleInputOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsEditing(false);
    setEditedFileName(fileName);
  };

  return (
    <FileSystemViewContextMenu rename={handleRenameFile}>
      <div className="file-system-view-node-container">
        <Icon icon={IconNames.DOCUMENT} />
        {isEditing && (
          <input
            type="text"
            autoFocus
            className="file-system-view-input"
            value={editedFileName}
            onChange={handleInputOnChange}
            onKeyDown={handleInputOnKeyDown}
            onBlur={handleInputOnBlur}
          />
        )}
        {!isEditing && fileName}
      </div>
    </FileSystemViewContextMenu>
  );
};

export default FileSystemViewFileNode;
