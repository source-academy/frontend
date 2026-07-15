import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import type { FSModule } from 'browserfs/dist/node/core/FS';
import path from 'path';
import { useState } from 'react';
import { useAppDispatch } from 'src/commons/utils/Hooks';

import { showSimpleConfirmDialog } from '../utils/DialogHelper';
import WorkspaceActions from '../workspace/WorkspaceActions';
import type { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import classes from './FileSystemView.module.css';
import FileSystemViewContextMenu from './FileSystemViewContextMenu';
import FileSystemViewFileName from './FileSystemViewFileName';
import FileSystemViewIndentationPadding from './FileSystemViewIndentationPadding';

type Props = {
  workspaceLocation: WorkspaceLocation;
  fileSystem: FSModule;
  basePath: string;
  fileName: string;
  indentationLevel: number;
  refreshDirectory: () => void;
};

function FileSystemViewFileNode({
  workspaceLocation,
  fileSystem,
  basePath,
  fileName,
  indentationLevel,
  refreshDirectory,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useAppDispatch();

  const fullPath = path.join(basePath, fileName);

  const handleOpenFile = () => {
    fileSystem.readFile(fullPath, 'utf-8', (err, fileContents) => {
      if (err) {
        console.error(err);
      }
      if (fileContents === undefined) {
        throw new Error('File contents are undefined.');
      }

      dispatch(WorkspaceActions.addEditorTab(workspaceLocation, fullPath, fileContents));
    });
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
      negativeLabel: 'Cancel',
    }).then((shouldProceed: boolean) => {
      if (!shouldProceed) {
        return;
      }

      fileSystem.unlink(fullPath, err => {
        if (err) {
          console.error(err);
        }

        dispatch(WorkspaceActions.removeEditorTabForFile(workspaceLocation, fullPath));
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
}

export default FileSystemViewFileNode;
