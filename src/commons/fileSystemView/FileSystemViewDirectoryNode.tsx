import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { FSModule } from 'browserfs/dist/node/core/FS';
import path from 'path';
import React from 'react';

import FileSystemViewContextMenu from './FileSystemViewContextMenu';
import FileSystemViewFileName from './FileSystemViewFileName';
import FileSystemViewIndentationPadding from './FileSystemViewIndentationPadding';
import FileSystemViewList from './FileSystemViewList';
import FileSystemViewPlaceholderNode from './FileSystemViewPlaceholderNode';

export type FileSystemViewDirectoryNodeProps = {
  fileSystem: FSModule;
  basePath: string;
  dirName: string;
  indentationLevel: number;
  refreshParentDirectory: () => void;
};

const FileSystemViewDirectoryNode: React.FC<FileSystemViewDirectoryNodeProps> = (
  props: FileSystemViewDirectoryNodeProps
) => {
  const { fileSystem, basePath, dirName, indentationLevel, refreshParentDirectory } = props;
  const fullPath = path.join(basePath, dirName);

  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [isAddingNewFile, setIsAddingNewFile] = React.useState<boolean>(false);

  const toggleIsExpanded = () => setIsExpanded(!isExpanded);
  const handleCreateNewFile = () => {
    setIsExpanded(true);
    setIsAddingNewFile(true);
  };
  const handleRenameDir = () => setIsEditing(true);

  const createNewFile = (fileName: string) => {
    const newFilePath = path.join(basePath, dirName, fileName);

    // Check whether the new file path already exists to prevent overwriting of existing files & directories.
    fileSystem.exists(newFilePath, newFilePathExists => {
      if (newFilePathExists) {
        // TODO: Implement modal that informs the user that the path already exists.
        return;
      }

      fileSystem.writeFile(newFilePath, '', err => {
        if (err) {
          console.error(err);
        }

        // TODO: Force child FileSystemViewList component to re-render.
      });
    });
  };

  return (
    <>
      <FileSystemViewContextMenu createNewFile={handleCreateNewFile} rename={handleRenameDir}>
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
            refreshDirectory={refreshParentDirectory}
          />
        </div>
      </FileSystemViewContextMenu>
      {isAddingNewFile && (
        <div className="file-system-view-node-container">
          <FileSystemViewIndentationPadding indentationLevel={indentationLevel + 1} />
          <Icon icon={IconNames.DOCUMENT} />
          <FileSystemViewPlaceholderNode
            processFileName={createNewFile}
            removePlaceholder={() => setIsAddingNewFile(false)}
          />
        </div>
      )}
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
