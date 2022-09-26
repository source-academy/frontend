import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
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
      <div className="file-system-view-node-container" onClick={toggleIsExpanded}>
        {isExpanded && <Icon icon={IconNames.CHEVRON_DOWN} />}
        {!isExpanded && <Icon icon={IconNames.CHEVRON_RIGHT} />}
        {dirName}
      </div>
      {isExpanded && <FileSystemViewList fileSystem={fileSystem} basePath={fullPath} />}
    </>
  );
};

export default FileSystemViewDirectoryNode;
