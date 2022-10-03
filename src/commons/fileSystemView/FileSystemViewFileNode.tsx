import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { FSModule } from 'browserfs/dist/node/core/FS';
import React from 'react';

import FileSystemViewContextMenu from './FileSystemViewContextMenu';
import FileSystemViewFileName from './FileSystemViewFileName';
import FileSystemViewIndentationPadding from './FileSystemViewIndentationPadding';

export type FileSystemViewFileNodeProps = {
  fileSystem: FSModule;
  basePath: string;
  fileName: string;
  indentationLevel: number;
  refreshDirectory: () => void;
};

const FileSystemViewFileNode: React.FC<FileSystemViewFileNodeProps> = (
  props: FileSystemViewFileNodeProps
) => {
  const { fileSystem, basePath, fileName, indentationLevel, refreshDirectory } = props;

  const [isEditing, setIsEditing] = React.useState<boolean>(false);

  const handleRenameFile = () => setIsEditing(true);

  return (
    <FileSystemViewContextMenu rename={handleRenameFile}>
      <div className="file-system-view-node-container">
        <FileSystemViewIndentationPadding indentationLevel={indentationLevel} />
        <Icon icon={IconNames.DOCUMENT} />
        <FileSystemViewFileName
          fileSystem={fileSystem}
          basePath={basePath}
          fileName={fileName}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          refreshDirectory={refreshDirectory}
        />
      </div>
    </FileSystemViewContextMenu>
  );
};

export default FileSystemViewFileNode;
