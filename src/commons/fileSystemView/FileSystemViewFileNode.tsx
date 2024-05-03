import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { FSModule } from 'browserfs/dist/node/core/FS';
import path from 'path';
import React from 'react';
import { useDispatch } from 'react-redux';
import classes from 'src/styles/FileSystemView.module.scss';

import { handleReadFile } from '../fileSystem/utils';
import { showSimpleConfirmDialog } from '../utils/DialogHelper';
import { addEditorTab, removeEditorTabForFile } from '../workspace/WorkspaceActions';
import { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import FileSystemViewContextMenu from './FileSystemViewContextMenu';
import FileSystemViewFileName from './FileSystemViewFileName';
import FileSystemViewIndentationPadding from './FileSystemViewIndentationPadding';

type Props = {
  workspaceLocation: WorkspaceLocation;
  fileSystem: FSModule;
  basePath: string;
  fileName: string;
  indentationLevel: number;
  disableEditing?: boolean;
  refreshDirectory: () => void;
};

const FileSystemViewFileNode: React.FC<Props> = ({
  workspaceLocation,
  fileSystem,
  basePath,
  fileName,
  indentationLevel,
  refreshDirectory,
  disableEditing
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const dispatch = useDispatch();

  const fullPath = path.join(basePath, fileName);

  const handleOpenFile = async () => {
    const fileContents = await handleReadFile(fileSystem, fullPath);

    dispatch(addEditorTab(workspaceLocation, fullPath, fileContents));
  };

  const handleRenameFile = () => setIsEditing(true);
  const handleRemoveFile = () => {
    showSimpleConfirmDialog({
      icon: 'warning-sign',
      title: `Are you sure you want to delete '${fileName}'?`,
      contents: (
        <p>
          Once a file is deleted, it cannot be recovered!
          <br />
          <br />
          <strong>Do you still want to proceed?</strong>
        </p>
      ),
      positiveIntent: 'danger',
      positiveLabel: 'Proceed',
      negativeLabel: 'Cancel'
    }).then((shouldProceed: boolean) => {
      if (!shouldProceed) {
        return;
      }

      fileSystem.unlink(fullPath, err => {
        if (err) {
          console.error(err);
        }

        dispatch(removeEditorTabForFile(workspaceLocation, fullPath));
        refreshDirectory();
      });
    });
  };

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Open file on double click.
    if (e.detail === 2) {
      handleOpenFile();
    }
  };

  return (
    <FileSystemViewContextMenu
      open={handleOpenFile}
      rename={handleRenameFile}
      remove={handleRemoveFile}
      disableEditing={disableEditing}
    >
      <div className={classes['file-system-view-node-container']} onClick={onClick}>
        <FileSystemViewIndentationPadding indentationLevel={indentationLevel} />
        <Icon icon={IconNames.DOCUMENT} />
        <FileSystemViewFileName
          workspaceLocation={workspaceLocation}
          fileSystem={fileSystem}
          basePath={basePath}
          fileName={fileName}
          isDirectory={false}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          refreshDirectory={refreshDirectory}
        />
      </div>
    </FileSystemViewContextMenu>
  );
};

export default FileSystemViewFileNode;
