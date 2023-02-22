import { FSModule } from 'browserfs/dist/node/core/FS';
import { action } from 'typesafe-actions';

import { SET_FILE_SYSTEM } from './FileSystemTypes';

export const setFileSystem = (fileSystem: FSModule) => action(SET_FILE_SYSTEM, { fileSystem });
