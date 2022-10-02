import { FSModule } from 'browserfs/dist/node/core/FS';
import classNames from 'classnames';
import React from 'react';

import FileSystemViewNode from './FileSystemViewNode';

export type FileSystemViewListProps = {
  fileSystem: FSModule;
  basePath: string;
  shouldIndentOneLevel: boolean;
};

const FileSystemViewList: React.FC<FileSystemViewListProps> = (props: FileSystemViewListProps) => {
  const { fileSystem, basePath, shouldIndentOneLevel } = props;

  const [fileNames, setFileNames] = React.useState<string[] | undefined>(undefined);

  const readDirectory = () => {
    fileSystem.readdir(basePath, (err, files) => {
      if (err) {
        console.error(err);
      }
      setFileNames(files);
    });
  };

  React.useEffect(readDirectory, [fileSystem, basePath]);

  // Display a spinner if the list of files has not been loaded.
  if (!fileNames) {
    // TODO: Style this.
    return <></>;
  }

  return (
    <div
      className={classNames('file-system-view-list-container', {
        'file-system-view-list-indentation': shouldIndentOneLevel
      })}
    >
      {fileNames.map(fileName => {
        return (
          <FileSystemViewNode
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
