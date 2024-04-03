import { Spinner, SpinnerSize } from '@blueprintjs/core';
import { FSModule } from 'browserfs/dist/node/core/FS';
import path from 'path';
import React from 'react';
import classes from 'src/styles/FileSystemView.module.scss';

import Delay from '../delay/Delay';
import { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import FileSystemViewDirectoryNode from './FileSystemViewDirectoryNode';
import FileSystemViewFileNode from './FileSystemViewFileNode';
import { PersistenceFile } from 'src/features/persistence/PersistenceTypes';

type Props = {
  workspaceLocation: WorkspaceLocation;
  fileSystem: FSModule;
  basePath: string;
  lastEditedFilePath: string;
  persistenceFileArray: PersistenceFile[];
  indentationLevel: number;
  isContextMenuDisabled: boolean;
};

export let refreshFileView: () => any; // TODO jank

const FileSystemViewList: React.FC<Props> = ({
  workspaceLocation,
  fileSystem,
  basePath,
  lastEditedFilePath,
  persistenceFileArray,
  indentationLevel,
  isContextMenuDisabled
}) => {
  const [dirNames, setDirNames] = React.useState<string[] | undefined>(undefined);
  const [fileNames, setFileNames] = React.useState<string[] | undefined>(undefined);

  const readDirectory = () => {
    fileSystem.readdir(basePath, async (err, fileNames) => {
      if (err) {
        console.error(err);
      }
      if (fileNames === undefined) {
        return;
      }

      const files: string[] = [];
      const directories: string[] = [];
      const lstatPromise = (fileName: string) => {
        const fullPath = path.join(basePath, fileName);
        return new Promise((resolve, reject) => {
          fileSystem.lstat(fullPath, (err, stats) => {
            if (err) {
              return reject(err);
            }
            if (stats === undefined) {
              return;
            }

            if (stats.isFile()) {
              files.push(fileName);
            } else if (stats.isDirectory()) {
              directories.push(fileName);
            }

            resolve(stats);
          });
        });
      };

      // Check the file type of each file in parallel.
      await Promise.all(fileNames.map(lstatPromise));
      setFileNames(files.sort());
      setDirNames(directories.sort());
    });
  };

  refreshFileView = readDirectory;

  React.useEffect(readDirectory, [fileSystem, basePath]);

  if (!fileNames || !dirNames) {
    return (
      <Delay waitInMsBeforeRender={200}>
        <Spinner className={classes['file-system-view-spinner']} size={SpinnerSize.SMALL} />
      </Delay>
    );
  }

  return (
    <div className={classes['file-system-view-list-container']}>
      {dirNames.map(dirName => {
        return (
          <FileSystemViewDirectoryNode
            workspaceLocation={workspaceLocation}
            key={dirName}
            fileSystem={fileSystem}
            basePath={basePath}
            lastEditedFilePath={lastEditedFilePath}
            persistenceFileArray={persistenceFileArray}
            directoryName={dirName}
            indentationLevel={indentationLevel}
            refreshParentDirectory={readDirectory}
            isContextMenuDisabled={isContextMenuDisabled}
          />
        );
      })}
      {fileNames.map(fileName => {
        return (
          <FileSystemViewFileNode
            workspaceLocation={workspaceLocation}
            key={fileName}
            fileSystem={fileSystem}
            basePath={basePath}
            lastEditedFilePath={lastEditedFilePath}
            persistenceFileArray={persistenceFileArray}
            fileName={fileName}
            indentationLevel={indentationLevel}
            refreshDirectory={readDirectory}
            isContextMenuDisabled={isContextMenuDisabled}
          />
        );
      })}
    </div>
  );
};

export default FileSystemViewList;
