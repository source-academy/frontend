import { createAction } from '@reduxjs/toolkit';
import { FSModule } from 'browserfs/dist/node/core/FS';

import { SET_IN_BROWSER_FILE_SYSTEM } from './FileSystemTypes';

export const setInBrowserFileSystem = createAction(
  SET_IN_BROWSER_FILE_SYSTEM,
  (inBrowserFileSystem: FSModule) => ({ payload: { inBrowserFileSystem } })
);
