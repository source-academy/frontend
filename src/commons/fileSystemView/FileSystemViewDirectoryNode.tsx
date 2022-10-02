import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { FSModule } from 'browserfs/dist/node/core/FS';
import path from 'path';
import React from 'react';

import FileSystemViewContextMenu from './FileSystemViewContextMenu';
import FileSystemViewFileName from './FileSystemViewFileName';
import FileSystemViewList from './FileSystemViewList';

export type FileSystemViewDirectoryNodeProps = {
  fileSystem: FSModule;
  basePath: string;
  dirName: string;
  refreshDirectory: () => void;
};

const FileSystemViewDirectoryNode: React.FC<FileSystemViewDirectoryNodeProps> = (
  props: FileSystemViewDirectoryNodeProps
) => {
  const { fileSystem, basePath, dirName, refreshDirectory } = props;
  const fullPath = path.join(basePath, dirName);

  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
  const [isEditing, setIsEditing] = React.useState<boolean>(false);

  const toggleIsExpanded = () => setIsExpanded(!isExpanded);
  const handleRenameDir = () => setIsEditing(true);

  return (
    <FileSystemViewContextMenu rename={handleRenameDir}>
      <>
        <div className="file-system-view-node-container" onClick={toggleIsExpanded}>
          {isExpanded && <Icon icon={IconNames.CHEVRON_DOWN} />}
          {!isExpanded && <Icon icon={IconNames.CHEVRON_RIGHT} />}
          <FileSystemViewFileName
            fileSystem={fileSystem}
            basePath={basePath}
            fileName={dirName}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            refreshDirectory={refreshDirectory}
          />
        </div>
        {isExpanded && (
          <FileSystemViewList fileSystem={fileSystem} basePath={fullPath} shouldIndentOneLevel />
        )}
      </>
    </FileSystemViewContextMenu>
  );
};

export default FileSystemViewDirectoryNode;
