import { FSModule } from 'browserfs/dist/node/core/FS';
import path from 'path';
import React from 'react';

import FileSystemViewDirectoryNode from './FileSystemViewDirectoryNode';
import FileSystemViewFileNode from './FileSystemViewFileNode';

export type FileSystemViewNodeProps = {
  fileSystem: FSModule;
  basePath: string;
  fileName: string;
  refreshDirectory: () => void;
};

enum FileType {
  FILE,
  DIRECTORY,
  UNKNOWN
}

const FileSystemViewNode: React.FC<FileSystemViewNodeProps> = (props: FileSystemViewNodeProps) => {
  const { fileSystem, basePath, fileName, refreshDirectory } = props;

  const [fileType, setFileType] = React.useState<FileType | undefined>(undefined);

  const fullPath = path.join(basePath, fileName);

  React.useEffect(() => {
    fileSystem.lstat(fullPath, (err, stats) => {
      if (err) {
        console.error(err);
      }
      if (stats === undefined) {
        setFileType(undefined);
        return;
      }
      if (stats.isFile()) {
        setFileType(FileType.FILE);
      } else if (stats.isDirectory()) {
        setFileType(FileType.DIRECTORY);
      } else {
        // This should never occur as every file is either a directory or a file.
        setFileType(FileType.UNKNOWN);
      }
    });
  }, [fileSystem, fullPath]);

  // Do not render this node if the file type has yet to be determined or is unknown.
  if (fileType === undefined || fileType === FileType.UNKNOWN) {
    return <></>;
  }

  return (
    <>
      {fileType === FileType.FILE && (
        <FileSystemViewFileNode
          fileSystem={fileSystem}
          basePath={basePath}
          fileName={fileName}
          refreshDirectory={refreshDirectory}
        />
      )}
      {fileType === FileType.DIRECTORY && (
        <FileSystemViewDirectoryNode
          fileSystem={fileSystem}
          basePath={basePath}
          dirName={fileName}
          refreshDirectory={refreshDirectory}
        />
      )}
    </>
  );
};

export default FileSystemViewNode;
