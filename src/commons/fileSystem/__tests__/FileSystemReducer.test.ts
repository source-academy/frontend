import { BFSRequire } from 'browserfs';

import { defaultFileSystem } from '../../application/ApplicationTypes';
import { FileSystemReducer } from '../FileSystemReducer';
import { SET_IN_BROWSER_FILE_SYSTEM } from '../FileSystemTypes';

describe('SET_IN_BROWSER_FILE_SYSTEM', () => {
  test('sets inBrowserFileSystem', () => {
    const inBrowserFileSystem = BFSRequire('fs');
    const action = {
      type: SET_IN_BROWSER_FILE_SYSTEM,
      payload: {
        inBrowserFileSystem
      }
    } as const;
    const result = FileSystemReducer(defaultFileSystem, action);
    expect(result).toEqual({
      ...defaultFileSystem,
      inBrowserFileSystem
    });
  });
});
