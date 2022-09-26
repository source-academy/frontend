import { FSModule } from 'browserfs/dist/node/core/FS';
import React from 'react';

export type FileSystemViewFileNodeProps = {
  fileSystem: FSModule;
  basePath: string;
  fileName: string;
};

const FileSystemViewFileNode: React.FC<FileSystemViewFileNodeProps> = (
  props: FileSystemViewFileNodeProps
) => {
  const { fileName } = props;

  return <div className="file-system-view-file-node-container">{fileName}</div>;
};

export default FileSystemViewFileNode;
