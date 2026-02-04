import { FSModule } from 'browserfs/dist/node/core/FS';

export const SET_IN_BROWSER_FILE_SYSTEM = 'SET_IN_BROWSER_FILE_SYSTEM';

export type FileSystemState = {
  inBrowserFileSystem: FSModule | null;
};
