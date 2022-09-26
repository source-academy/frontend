import { FSModule } from 'browserfs/dist/node/core/FS';
import path from 'path';
import React from 'react';

import FileSystemViewList from './FileSystemViewList';

export type FileSystemViewDirectoryNodeProps = {
  fileSystem: FSModule;
  basePath: string;
  dirName: string;
};

const FileSystemViewDirectoryNode: React.FC<FileSystemViewDirectoryNodeProps> = (
  props: FileSystemViewDirectoryNodeProps
) => {
  const { fileSystem, basePath, dirName } = props;
  const fullPath = path.join(basePath, dirName);

  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);

  const toggleIsExpanded = () => setIsExpanded(!isExpanded);

  return (
    <>
      <div className="file-system-view-dir-node-container" onClick={toggleIsExpanded}>
        {dirName}
      </div>
      {isExpanded && <FileSystemViewList fileSystem={fileSystem} basePath={fullPath} />}
    </>
  );
};

export default FileSystemViewDirectoryNode;
