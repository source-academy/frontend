import { FSModule } from 'browserfs/dist/node/core/FS';

export const SET_FILE_SYSTEM = 'SET_FILE_SYSTEM';

export type FileSystemState = {
  fileSystem: FSModule | null;
};
