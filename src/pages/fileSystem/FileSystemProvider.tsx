import { BFSRequire, configure } from 'browserfs';
import { ApiError } from 'browserfs/dist/node/core/api_error';
import { FSModule } from 'browserfs/dist/node/core/FS';
import React, { createContext, ReactNode, useState } from 'react';

export const FileSystemContext = createContext<FSModule | undefined>(undefined);

type FileSystemProviderProps = {
  children: ReactNode;
};

const FileSystemProvider: React.FC<FileSystemProviderProps> = ({ children }) => {
  const [fileSystem, setFileSystem] = useState<FSModule>();

  configure(
    {
      fs: 'MountableFileSystem',
      options: {
        '/playground': {
          fs: 'IndexedDB',
          options: {
            storeName: 'playground'
          }
        }
      }
    },
    (err: ApiError | null | undefined) => {
      if (err) {
        console.error(err);
      }
      setFileSystem(BFSRequire('fs'));
    }
  );

  return <FileSystemContext.Provider value={fileSystem}>{children}</FileSystemContext.Provider>;
};

export default FileSystemProvider;
