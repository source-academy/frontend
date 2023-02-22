import { FSModule } from 'browserfs/dist/node/core/FS';
import { action } from 'typesafe-actions';

import { SET_IN_BROWSER_FILE_SYSTEM } from './FileSystemTypes';

export const setInBrowserFileSystem = (inBrowserFileSystem: FSModule) =>
  action(SET_IN_BROWSER_FILE_SYSTEM, { inBrowserFileSystem });
