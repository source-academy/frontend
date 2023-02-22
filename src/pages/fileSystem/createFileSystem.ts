import { BFSRequire, configure } from 'browserfs';
import { ApiError } from 'browserfs/dist/node/core/api_error';
import { Store } from 'redux';

import { setInBrowserFileSystem } from '../../commons/fileSystem/FileSystemActions';

export const createFileSystem = (store: Store) => {
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
      store.dispatch(setInBrowserFileSystem(BFSRequire('fs')));
    }
  );
};
