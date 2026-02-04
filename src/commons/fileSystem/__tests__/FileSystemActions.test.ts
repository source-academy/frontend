import { BFSRequire } from 'browserfs';

import { setInBrowserFileSystem } from '../FileSystemActions';
import { SET_IN_BROWSER_FILE_SYSTEM } from '../FileSystemTypes';

test('setInBrowserFileSystem generates correct action object', () => {
  const inBrowserFileSystem = BFSRequire('fs');
  const action = setInBrowserFileSystem(inBrowserFileSystem);
  expect(action).toEqual({
    type: SET_IN_BROWSER_FILE_SYSTEM,
    payload: { inBrowserFileSystem }
  });
});
