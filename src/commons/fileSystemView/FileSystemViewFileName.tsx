import { FSModule } from 'browserfs/dist/node/core/FS';
import path from 'path';
import React from 'react';

import { showSimpleErrorDialog } from '../utils/DialogHelper';

export type FileSystemViewFileNameProps = {
  fileSystem: FSModule;
  basePath: string;
  fileName: string;
  isDirectory: boolean;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  refreshDirectory: () => void;
};

const FileSystemViewFileName: React.FC<FileSystemViewFileNameProps> = (
  props: FileSystemViewFileNameProps
) => {
  const { fileSystem, basePath, fileName, isDirectory, isEditing, setIsEditing, refreshDirectory } =
    props;

  const [editedFileName, setEditedFileName] = React.useState<string>(fileName);

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
          showSimpleErrorDialog({
            title: `Unable to rename ${isDirectory ? 'directory' : 'file'}`,
            contents: (
              <p>
                A file or folder <b>{editedFileName}</b> already exists in this location. Please
                choose a different name.
              </p>
            ),
            label: 'OK'
          }).then(() => setEditedFileName(fileName));
          return;
        }

        fileSystem.rename(oldPath, newPath, err => {
          if (err) {
            console.error(err);
          }
          refreshDirectory();
        });
      });
    } else if (e.key === 'Escape') {
      handleInputOnBlur();
    }
  };
  const handleInputOnBlur = () => {
    setIsEditing(false);
    setEditedFileName(fileName);
  };

  return (
    <>
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
    </>
  );
};

export default FileSystemViewFileName;
