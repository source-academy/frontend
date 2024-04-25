import { Colors, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { FSModule } from 'browserfs/dist/node/core/FS';
import path from 'path';
import React from 'react';
import { useDispatch } from 'react-redux';
import { githubDeleteFile } from 'src/features/github/GitHubActions';
import { persistenceDeleteFile } from 'src/features/persistence/PersistenceActions';
import { PersistenceFile } from 'src/features/persistence/PersistenceTypes';
import classes from 'src/styles/FileSystemView.module.scss';

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
  lastEditedFilePath: string;
  persistenceFileArray: PersistenceFile[];
  fileName: string;
  indentationLevel: number;
  refreshDirectory: () => void;
  isContextMenuDisabled: boolean;
};

const FileSystemViewFileNode: React.FC<Props> = ({
  workspaceLocation,
  fileSystem,
  basePath,
  lastEditedFilePath,
  persistenceFileArray,
  fileName,
  indentationLevel,
  refreshDirectory,
  isContextMenuDisabled
}) => {
  const [currColor, setCurrColor] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    const myFileMetadata = persistenceFileArray
      .filter(e => e.path === basePath + '/' + fileName)
      ?.at(0);
    const checkColor = (myFileMetadata: PersistenceFile | undefined) =>
      myFileMetadata
        ? myFileMetadata.lastSaved
          ? myFileMetadata.lastEdit
            ? myFileMetadata.lastEdit > myFileMetadata.lastSaved
              ? Colors.ORANGE4
              : Colors.BLUE4
            : Colors.BLUE4
          : Colors.BLUE4
        : undefined;
    setCurrColor(checkColor(myFileMetadata));
  }, [lastEditedFilePath, basePath, fileName, persistenceFileArray]);

  const [isEditing, setIsEditing] = React.useState(false);
  const dispatch = useDispatch();
  // const store = useStore<OverallState>();

  const fullPath = path.join(basePath, fileName);

  const handleOpenFile = () => {
    fileSystem.readFile(fullPath, 'utf-8', async (err, fileContents) => {
      if (err) {
        console.error(err);
      }
      if (fileContents === undefined) {
        throw new Error('File contents are undefined.');
      }
      dispatch(addEditorTab(workspaceLocation, fullPath, fileContents));
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
      negativeLabel: 'Cancel'
    }).then((shouldProceed: boolean) => {
      if (!shouldProceed) {
        return;
      }

      fileSystem.unlink(fullPath, err => {
        if (err) {
          console.error(err);
        }
        dispatch(persistenceDeleteFile(fullPath));
        dispatch(githubDeleteFile(fullPath));

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
      isContextMenuDisabled={isContextMenuDisabled}
    >
      <div className={classes['file-system-view-node-container']} onClick={onClick}>
        <FileSystemViewIndentationPadding indentationLevel={indentationLevel} />
        <Icon icon={IconNames.DOCUMENT} style={{ color: currColor }} />
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
