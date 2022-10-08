import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { FSModule } from 'browserfs/dist/node/core/FS';
import path from 'path';
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
  const handleRemoveFile = () => {
    // TODO: Prompt user for confirmation before deleting file.
    const fullPath = path.join(basePath, fileName);
    fileSystem.unlink(fullPath, err => {
      if (err) {
        console.error(err);
      }

      refreshDirectory();
    });
  };

  return (
    <FileSystemViewContextMenu rename={handleRenameFile} remove={handleRemoveFile}>
      <div className="file-system-view-node-container">
        <FileSystemViewIndentationPadding indentationLevel={indentationLevel} />
        <Icon icon={IconNames.DOCUMENT} />
        <FileSystemViewFileName
          fileSystem={fileSystem}
          basePath={basePath}
          fileName={fileName}
          isDirectory={false}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          refreshDirectory={refreshDirectory}
        />
      </div>
    </FileSystemViewContextMenu>
  );
};

export default FileSystemViewFileNode;
