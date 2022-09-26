import { FSModule } from 'browserfs/dist/node/core/FS';
import React from 'react';

export type FileSystemViewNodeProps = {
  fileSystem: FSModule;
  path: string;
  fileName: string;
};

const FileSystemViewNode: React.FC<FileSystemViewNodeProps> = (props: FileSystemViewNodeProps) => {
  const { fileName } = props;
  return <div className="file-system-view-node-container">{fileName}</div>;
};

export default FileSystemViewNode;
