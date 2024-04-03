import { createAction } from '@reduxjs/toolkit';
import { FSModule } from 'browserfs/dist/node/core/FS';
import { GitHubSaveInfo } from 'src/features/github/GitHubTypes';
import { PersistenceFile } from 'src/features/persistence/PersistenceTypes';

import { 
  ADD_GITHUB_SAVE_INFO,
  ADD_PERSISTENCE_FILE,
  DELETE_ALL_GITHUB_SAVE_INFO,
  DELETE_ALL_PERSISTENCE_FILES,  DELETE_GITHUB_SAVE_INFO,
  DELETE_PERSISTENCE_FILE, 
  SET_IN_BROWSER_FILE_SYSTEM,
  SET_PERSISTENCE_FILE_LAST_EDIT_BY_PATH, 
  UPDATE_PERSISTENCE_FILE_PATH_AND_NAME_BY_PATH,
  UPDATE_LAST_EDITED_FILE_PATH,
  UPDATE_REFRESH_FILE_VIEW_KEY } from './FileSystemTypes';

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

export const addPersistenceFile = createAction(
  ADD_PERSISTENCE_FILE,
  ( persistenceFile: PersistenceFile ) => ({ payload: persistenceFile })
);

export const deletePersistenceFile = createAction(
  DELETE_PERSISTENCE_FILE,
  ( persistenceFile: PersistenceFile ) => ({ payload: persistenceFile })
);

export const updatePersistenceFilePathAndNameByPath = createAction(
  UPDATE_PERSISTENCE_FILE_PATH_AND_NAME_BY_PATH,
  (oldPath: string, newPath: string, newFileName: string) => ({ payload: {oldPath, newPath, newFileName}})
);

export const deleteAllPersistenceFiles = createAction(
  DELETE_ALL_PERSISTENCE_FILES,
  () => ({ payload: {} })
);

export const setPersistenceFileLastEditByPath = createAction(
  SET_PERSISTENCE_FILE_LAST_EDIT_BY_PATH,
  (path: string, date: Date) => ({ payload: {path, date} })
);

export const updateLastEditedFilePath = createAction(
  UPDATE_LAST_EDITED_FILE_PATH,
  ( lastEditedFilePath: string) => ({ payload: {lastEditedFilePath} })
);

export const updateRefreshFileViewKey = createAction(
  UPDATE_REFRESH_FILE_VIEW_KEY,
  () => ({ payload: {} })
);