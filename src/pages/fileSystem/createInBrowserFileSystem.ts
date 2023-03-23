import { BFSRequire, configure } from 'browserfs';
import { ApiError } from 'browserfs/dist/node/core/api_error';
import { Store } from 'redux';

import { setInBrowserFileSystem } from '../../commons/fileSystem/FileSystemActions';
import { BASE_PLAYGROUND_FILE_PATH } from '../playground/Playground';

export const createInBrowserFileSystem = (store: Store) => {
  configure(
    {
      fs: 'MountableFileSystem',
      options: {
        [BASE_PLAYGROUND_FILE_PATH]: {
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
