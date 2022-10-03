import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { FSModule } from 'browserfs/dist/node/core/FS';
import path from 'path';
import React from 'react';

import FileSystemViewContextMenu from './FileSystemViewContextMenu';
import FileSystemViewFileName from './FileSystemViewFileName';
import FileSystemViewIndentationPadding from './FileSystemViewIndentationPadding';
import FileSystemViewList from './FileSystemViewList';

export type FileSystemViewDirectoryNodeProps = {
  fileSystem: FSModule;
  basePath: string;
  dirName: string;
  indentationLevel: number;
  refreshDirectory: () => void;
};

const FileSystemViewDirectoryNode: React.FC<FileSystemViewDirectoryNodeProps> = (
  props: FileSystemViewDirectoryNodeProps
) => {
  const { fileSystem, basePath, dirName, indentationLevel, refreshDirectory } = props;
  const fullPath = path.join(basePath, dirName);

  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
  const [isEditing, setIsEditing] = React.useState<boolean>(false);

  const toggleIsExpanded = () => setIsExpanded(!isExpanded);
  const handleRenameDir = () => setIsEditing(true);

  return (
    <>
      <FileSystemViewContextMenu rename={handleRenameDir}>
        <div className="file-system-view-node-container" onClick={toggleIsExpanded}>
          <FileSystemViewIndentationPadding indentationLevel={indentationLevel} />
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
      </FileSystemViewContextMenu>
      {isExpanded && (
        <FileSystemViewList
          fileSystem={fileSystem}
          basePath={fullPath}
          indentationLevel={indentationLevel + 1}
        />
      )}
    </>
  );
};

export default FileSystemViewDirectoryNode;
