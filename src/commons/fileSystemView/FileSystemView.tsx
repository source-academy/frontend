import React, { useContext } from 'react';

import { FileSystemContext } from '../../pages/fileSystem/FileSystemProvider';
import FileSystemViewNode from './FileSystemViewNode';

export type FileSystemViewProps = {
  basePath: string;
};

const FileSystemView: React.FC<FileSystemViewProps> = (props: FileSystemViewProps) => {
  const { basePath } = props;
  const fileSystem = useContext(FileSystemContext);

  const [fileNames, setFileNames] = React.useState<string[] | undefined>(undefined);

  React.useEffect(() => {
    if (!fileSystem) {
      return;
    }
    fileSystem.readdir(basePath, (err, files) => {
      if (err) {
        console.error(err);
      }
      setFileNames(files);
    });
  }, [fileSystem, basePath]);

  // Display an error message if the file system cannot be loaded.
  if (!fileSystem) {
    // TODO: Style this.
    return <>Unable to load file system.</>;
  }

  // Display a spinner if the list of files has not been loaded.
  if (!fileNames) {
    // TODO: Style this.
    return <></>;
  }

  return (
    <>
      {fileNames.map(fileName => {
        return <FileSystemViewNode fileSystem={fileSystem} path={basePath} fileName={fileName} />;
      })}
    </>
  );
};

export default FileSystemView;
