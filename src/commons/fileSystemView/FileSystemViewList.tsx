import { FSModule } from 'browserfs/dist/node/core/FS';
import classNames from 'classnames';
import path from 'path';
import React from 'react';

import FileSystemViewDirectoryNode from './FileSystemViewDirectoryNode';
import FileSystemViewFileNode from './FileSystemViewFileNode';

export type FileSystemViewListProps = {
  fileSystem: FSModule;
  basePath: string;
  shouldIndentOneLevel: boolean;
};

const FileSystemViewList: React.FC<FileSystemViewListProps> = (props: FileSystemViewListProps) => {
  const { fileSystem, basePath, shouldIndentOneLevel } = props;

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

  React.useEffect(readDirectory, [fileSystem, basePath]);

  // Display a spinner if the list of files or directories have not been loaded.
  if (!fileNames || !dirNames) {
    // TODO: Style this.
    return <></>;
  }

  return (
    <div
      className={classNames('file-system-view-list-container', {
        'file-system-view-list-indentation': shouldIndentOneLevel
      })}
    >
      {dirNames.map(dirName => {
        return (
          <FileSystemViewDirectoryNode
            key={dirName}
            fileSystem={fileSystem}
            basePath={basePath}
            dirName={dirName}
            refreshDirectory={readDirectory}
          />
        );
      })}
      {fileNames.map(fileName => {
        return (
          <FileSystemViewFileNode
            key={fileName}
            fileSystem={fileSystem}
            basePath={basePath}
            fileName={fileName}
            refreshDirectory={readDirectory}
          />
        );
      })}
    </div>
  );
};

export default FileSystemViewList;
