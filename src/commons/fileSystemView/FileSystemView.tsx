import React, { useContext } from 'react';

import { FileSystemContext } from '../../pages/fileSystem/FileSystemProvider';

export type FileSystemViewProps = {
  basePath: string;
};

const FileSystemView: React.FC<FileSystemViewProps> = (props: FileSystemViewProps) => {
  const fileSystem = useContext(FileSystemContext);

  const [files, setFiles] = React.useState<string[] | undefined>(undefined);

  React.useEffect(() => {
    if (!fileSystem) {
      return;
    }
    fileSystem.readdir(props.basePath, (err, files) => {
      if (err) {
        console.error(err);
      }
      setFiles(files);
    });
  }, [fileSystem, props.basePath]);

  // Display an error message if the file system cannot be loaded.
  if (!fileSystem) {
    // TODO: Style this.
    return <>Unable to load file system.</>;
  }

  return <></>;
};

export default FileSystemView;
