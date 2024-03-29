import { FSModule } from 'browserfs/dist/node/core/FS';
import { GitHubSaveInfo } from 'src/features/github/GitHubTypes';

export const SET_IN_BROWSER_FILE_SYSTEM = 'SET_IN_BROWSER_FILE_SYSTEM';
export const ADD_GITHUB_SAVE_INFO = 'ADD_GITHUB_SAVE_INFO';
export const DELETE_GITHUB_SAVE_INFO = 'DELETE_GITHUB_SAVE_INFO';
export const DELETE_ALL_GITHUB_SAVE_INFO = 'DELETE_ALL_GITHUB_SAVE_INFO';
export const UPDATE_GITHUB_SAVE_INFO = 'UPDATE_GITHUB_SAVE_INFO';

export type FileSystemState = {
  inBrowserFileSystem: FSModule | null;
  githubSaveInfoArray: GitHubSaveInfo[];
};
