import { createAction } from '@reduxjs/toolkit';
import { GitHubSaveInfo } from 'src/features/github/GitHubTypes';
import { FSModule } from 'browserfs/dist/node/core/FS';

import { 
  ADD_GITHUB_SAVE_INFO,
  DELETE_ALL_GITHUB_SAVE_INFO,
  DELETE_GITHUB_SAVE_INFO,
  SET_IN_BROWSER_FILE_SYSTEM,
  UPDATE_GITHUB_SAVE_INFO,
  ADD_PERSISTENCE_FILE,
  DELETE_PERSISTENCE_FILE, 
  DELETE_ALL_PERSISTENCE_FILES } from './FileSystemTypes';
import { PersistenceFile } from 'src/features/persistence/PersistenceTypes';

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
export const updateGithubSaveInfo = createAction(
  UPDATE_GITHUB_SAVE_INFO,
  (repoName: string,
    filePath: string,
    lastSaved: Date) => ({ payload: {repoName, filePath, lastSaved} })
);

export const addPersistenceFile = createAction(
  ADD_PERSISTENCE_FILE,
  ( persistenceFile: PersistenceFile ) => ({ payload: persistenceFile })
);

export const deletePersistenceFile = createAction(
  DELETE_PERSISTENCE_FILE,
  (persistenceFile: PersistenceFile) => ({ payload: persistenceFile })
);

export const deleteAllPersistenceFiles = createAction(
  DELETE_ALL_PERSISTENCE_FILES,
  () => ({ payload: {} })
);
