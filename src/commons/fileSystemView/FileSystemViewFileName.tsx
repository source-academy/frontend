import { FSModule } from 'browserfs/dist/node/core/FS';
import path from 'path';
import React from 'react';

export type FileSystemViewFileNameProps = {
  fileSystem: FSModule;
  basePath: string;
  fileName: string;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  refreshDirectory: () => void;
};

const FileSystemViewFileName: React.FC<FileSystemViewFileNameProps> = (
  props: FileSystemViewFileNameProps
) => {
  const { fileSystem, basePath, fileName, isEditing, setIsEditing, refreshDirectory } = props;

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
