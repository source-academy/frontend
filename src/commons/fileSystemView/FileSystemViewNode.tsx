import { FSModule } from 'browserfs/dist/node/core/FS';
import path from 'path';
import React from 'react';

export type FileSystemViewNodeProps = {
  fileSystem: FSModule;
  basePath: string;
  fileName: string;
};

enum FileType {
  FILE,
  DIRECTORY,
  UNKNOWN
}

const FileSystemViewNode: React.FC<FileSystemViewNodeProps> = (props: FileSystemViewNodeProps) => {
  const { fileSystem, basePath, fileName } = props;

  const [fileType, setFileType] = React.useState<FileType | undefined>(undefined);

  React.useEffect(() => {
    const fullPath = path.join(basePath, fileName);
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
  }, [fileSystem, basePath, fileName]);

  // Do not render this node if the file type has yet to be determined or is unknown.
  if (fileType === undefined || fileType === FileType.UNKNOWN) {
    return <></>;
  }

  const fileView: JSX.Element = <>{fileName}</>;
  const directoryView: JSX.Element = <>{fileName}</>;

  return (
    <div className="file-system-view-node-container">
      {fileType === FileType.FILE && fileView}
      {fileType === FileType.DIRECTORY && directoryView}
    </div>
  );
};

export default FileSystemViewNode;
