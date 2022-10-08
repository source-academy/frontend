import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import path from 'path';
import React, { useContext } from 'react';

import { FileSystemContext } from '../../pages/fileSystem/FileSystemProvider';
import { showSimpleErrorDialog } from '../utils/DialogHelper';
import FileSystemViewContextMenu from './FileSystemViewContextMenu';
import FileSystemViewIndentationPadding from './FileSystemViewIndentationPadding';
import FileSystemViewList from './FileSystemViewList';
import FileSystemViewPlaceholderNode from './FileSystemViewPlaceholderNode';

export type FileSystemViewProps = {
  basePath: string;
};

const FileSystemView: React.FC<FileSystemViewProps> = (props: FileSystemViewProps) => {
  const { basePath } = props;
  const fileSystem = useContext(FileSystemContext);

  const [isAddingNewFile, setIsAddingNewFile] = React.useState<boolean>(false);
  const [fileSystemViewListKey, setFileSystemViewListKey] = React.useState<number>(0);

  const handleCreateNewFile = () => setIsAddingNewFile(true);
  // Forcibly re-render any child components in which the value `key` is passed as the prop `key`.
  // See https://github.com/source-academy/frontend/wiki/File-System#handling-file-system-updates.
  const forceRefreshFileSystemViewList = () =>
    setFileSystemViewListKey((fileSystemViewListKey + 1) % 2);

  if (!fileSystem) {
    return <div className="file-system-view-error">Unable to load file system.</div>;
  }

  const createNewFile = (fileName: string) => {
    const newFilePath = path.join(basePath, fileName);

    // Check whether the new file path already exists to prevent overwriting of existing files & directories.
    fileSystem.exists(newFilePath, newFilePathExists => {
      if (newFilePathExists) {
        showSimpleErrorDialog({
          title: 'Unable to create file',
          contents: (
            <p>
              A file or folder <b>{fileName}</b> already exists in this location. Please choose a
              different name.
            </p>
          ),
          label: 'OK'
        }).then(() => {});
        return;
      }

      fileSystem.writeFile(newFilePath, '', err => {
        if (err) {
          console.error(err);
        }

        forceRefreshFileSystemViewList();
      });
    });
  };

  return (
    <div className="file-system-view-container">
      <FileSystemViewList
        key={fileSystemViewListKey}
        fileSystem={fileSystem}
        basePath={basePath}
        indentationLevel={0}
      />
      {isAddingNewFile && (
        <div className="file-system-view-node-container">
          <FileSystemViewIndentationPadding indentationLevel={0} />
          <Icon icon={IconNames.DOCUMENT} />
          <FileSystemViewPlaceholderNode
            processFileName={createNewFile}
            removePlaceholder={() => setIsAddingNewFile(false)}
          />
        </div>
      )}
      <FileSystemViewContextMenu
        className="file-system-view-empty-space"
        createNewFile={handleCreateNewFile}
      />
    </div>
  );
};

export default FileSystemView;
