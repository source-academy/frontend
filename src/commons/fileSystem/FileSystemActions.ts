import { createAction } from '@reduxjs/toolkit';
import { FSModule } from 'browserfs/dist/node/core/FS';

import { 
  SET_IN_BROWSER_FILE_SYSTEM,
  ADD_GITHUB_SAVE_INFO,
  DELETE_GITHUB_SAVE_INFO,
  DELETE_ALL_GITHUB_SAVE_INFO
 } from './FileSystemTypes';
import { GitHubSaveInfo } from 'src/features/github/GitHubTypes';

export const setInBrowserFileSystem = createAction(
  SET_IN_BROWSER_FILE_SYSTEM,
  (inBrowserFileSystem: FSModule) => ({ payload: { inBrowserFileSystem } })
);

export const addGithubSaveInfo = createAction(
  ADD_GITHUB_SAVE_INFO,
  (githubSaveInfo: GitHubSaveInfo) => ({ payload: { githubSaveInfo }})
);

export const deleteGithubSaveInfo = createAction(
  DELETE_GITHUB_SAVE_INFO,
  (githubSaveInfo: GitHubSaveInfo) => ({ payload: { githubSaveInfo }})
);

export const deleteAllGithubSaveInfo = createAction(
  DELETE_ALL_GITHUB_SAVE_INFO,
  () => ({ payload: {} })
);
