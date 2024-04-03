import { FSModule } from 'browserfs/dist/node/core/FS';
import { PersistenceFile } from 'src/features/persistence/PersistenceTypes';

export const SET_IN_BROWSER_FILE_SYSTEM = 'SET_IN_BROWSER_FILE_SYSTEM';
export const ADD_GITHUB_SAVE_INFO = 'ADD_GITHUB_SAVE_INFO';
export const ADD_PERSISTENCE_FILE = 'ADD_PERSISTENCE_FILE';
export const DELETE_GITHUB_SAVE_INFO = 'DELETE_GITHUB_SAVE_INFO';
export const DELETE_PERSISTENCE_FILE = 'DELETE_PERSISTENCE_FILE';
export const DELETE_ALL_GITHUB_SAVE_INFO = 'DELETE_ALL_GITHUB_SAVE_INFO';
export const UPDATE_GITHUB_SAVE_INFO = 'UPDATE_GITHUB_SAVE_INFO';
export const DELETE_ALL_PERSISTENCE_FILES = 'DELETE_ALL_PERSISTENCE_FILES';
export const SET_PERSISTENCE_FILE_LAST_EDIT_BY_PATH = 'SET_PERSISTENCE_FILE_LAST_EDIT_BY_PATH';

export type FileSystemState = {
  inBrowserFileSystem: FSModule | null;
  persistenceFileArray: PersistenceFile[];
};
