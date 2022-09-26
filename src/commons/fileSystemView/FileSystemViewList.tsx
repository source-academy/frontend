import { FSModule } from 'browserfs/dist/node/core/FS';
import React from 'react';

import FileSystemViewNode from './FileSystemViewNode';

export type FileSystemViewListProps = {
  fileSystem: FSModule;
  basePath: string;
};

const FileSystemViewList: React.FC<FileSystemViewListProps> = (props: FileSystemViewListProps) => {
  const { fileSystem, basePath } = props;

  const [fileNames, setFileNames] = React.useState<string[] | undefined>(undefined);

  React.useEffect(() => {
    fileSystem.readdir(basePath, (err, files) => {
      if (err) {
        console.error(err);
      }
      setFileNames(files);
    });
  }, [fileSystem, basePath]);

  // Display a spinner if the list of files has not been loaded.
  if (!fileNames) {
    // TODO: Style this.
    return <></>;
  }

  return (
    <div className="file-system-view-list-container">
      {fileNames.map(fileName => {
        return (
          <FileSystemViewNode
            key={fileName}
            fileSystem={fileSystem}
            basePath={basePath}
            fileName={fileName}
          />
        );
      })}
    </div>
  );
};

export default FileSystemViewList;
