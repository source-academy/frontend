import React, { useContext } from 'react';

import { FileSystemContext } from '../../pages/fileSystem/FileSystemProvider';
import FileSystemViewContextMenu from './FileSystemViewContextMenu';
import FileSystemViewList from './FileSystemViewList';

export type FileSystemViewProps = {
  basePath: string;
};

const FileSystemView: React.FC<FileSystemViewProps> = (props: FileSystemViewProps) => {
  const { basePath } = props;
  const fileSystem = useContext(FileSystemContext);

  if (!fileSystem) {
    return <div className="file-system-view-container">Unable to load file system.</div>;
  }

  return (
    <div className="file-system-view-container">
      <FileSystemViewList fileSystem={fileSystem} basePath={basePath} indentationLevel={0} />
      <FileSystemViewContextMenu className="file-system-view-empty-space" />
    </div>
  );
};

export default FileSystemView;
