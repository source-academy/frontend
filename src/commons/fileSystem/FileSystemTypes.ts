import { FSModule } from 'browserfs/dist/node/core/FS';
import { PersistenceFile } from 'src/features/persistence/PersistenceTypes';

export const SET_IN_BROWSER_FILE_SYSTEM = 'SET_IN_BROWSER_FILE_SYSTEM';
export const ADD_GITHUB_SAVE_INFO = 'ADD_GITHUB_SAVE_INFO';
export const ADD_PERSISTENCE_FILE = 'ADD_PERSISTENCE_FILE';
export const DELETE_GITHUB_SAVE_INFO = 'DELETE_GITHUB_SAVE_INFO';
export const DELETE_PERSISTENCE_FILE = 'DELETE_PERSISTENCE_FILE';
export const DELETE_ALL_GITHUB_SAVE_INFO = 'DELETE_ALL_GITHUB_SAVE_INFO';
export const DELETE_ALL_PERSISTENCE_FILES = 'DELETE_ALL_PERSISTENCE_FILES';
export const UPDATE_PERSISTENCE_FILE_PATH_AND_NAME_BY_PATH = 'UPDATE_PERSISTENCE_FILE_PATH_AND_NAME_BY_PATH';
export const SET_PERSISTENCE_FILE_LAST_EDIT_BY_PATH = 'SET_PERSISTENCE_FILE_LAST_EDIT_BY_PATH';
export const UPDATE_LAST_EDITED_FILE_PATH = 'UPDATE_LAST_EDITED_FILE_PATH';
export const UPDATE_REFRESH_FILE_VIEW_KEY = 'UPDATE_REFRESH_FILE_VIEW_KEY';

export type FileSystemState = {
  inBrowserFileSystem: FSModule | null;
  persistenceFileArray: PersistenceFile[];
  lastEditedFilePath: string;
  refreshFileViewKey: integer
};
