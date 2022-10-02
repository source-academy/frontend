import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { FSModule } from 'browserfs/dist/node/core/FS';
import React from 'react';

import FileSystemViewContextMenu from './FileSystemViewContextMenu';

export type FileSystemViewFileNodeProps = {
  fileSystem: FSModule;
  basePath: string;
  fileName: string;
};

const FileSystemViewFileNode: React.FC<FileSystemViewFileNodeProps> = (
  props: FileSystemViewFileNodeProps
) => {
  const { fileName } = props;

  return (
    <FileSystemViewContextMenu>
      <div className="file-system-view-node-container">
        <Icon icon={IconNames.DOCUMENT} />
        {fileName}
      </div>
    </FileSystemViewContextMenu>
  );
};

export default FileSystemViewFileNode;
