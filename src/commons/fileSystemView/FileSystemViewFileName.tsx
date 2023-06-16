import { FSModule } from 'browserfs/dist/node/core/FS';
import path from 'path';
import React from 'react';
import { useDispatch } from 'react-redux';

import { showSimpleErrorDialog } from '../utils/DialogHelper';
import {
  renameEditorTabForFile,
  renameEditorTabsForDirectory
} from '../workspace/WorkspaceActions';
import { WorkspaceLocation } from '../workspace/WorkspaceTypes';

export type FileSystemViewFileNameProps = {
  workspaceLocation: WorkspaceLocation;
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
  const {
    workspaceLocation,
    fileSystem,
    basePath,
    fileName,
    isDirectory,
    isEditing,
    setIsEditing,
    refreshDirectory
  } = props;

  const [editedFileName, setEditedFileName] = React.useState<string>(fileName);
  const dispatch = useDispatch();

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

          if (isDirectory) {
            dispatch(renameEditorTabsForDirectory(workspaceLocation, oldPath, newPath));
          } else {
            dispatch(renameEditorTabForFile(workspaceLocation, oldPath, newPath));
          }
          refreshDirectory();
        });
      });
    } else if (e.key === 'Escape') {
      handleInputOnBlur();
    }
  };
  const handleInputOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const fileExtensionIndex = e.target.value.lastIndexOf('.');
    const fileExtensionExists = fileExtensionIndex !== -1;
    if (fileExtensionExists) {
      e.target.setSelectionRange(0, fileExtensionIndex);
      return;
    }
    e.target.select();
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
          spellCheck={false}
          className="file-system-view-input"
          value={editedFileName}
          onChange={handleInputOnChange}
          onKeyDown={handleInputOnKeyDown}
          onFocus={handleInputOnFocus}
          onBlur={handleInputOnBlur}
        />
      )}
      {!isEditing && <div className="file-system-view-file-name">{fileName}</div>}
    </>
  );
};

export default FileSystemViewFileName;
