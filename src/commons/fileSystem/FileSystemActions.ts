import { FSModule } from 'browserfs/dist/node/core/FS';
import { action } from 'typesafe-actions';

import { 
  SET_IN_BROWSER_FILE_SYSTEM,
  ADD_GITHUB_SAVE_INFO,
  ADD_PERSISTENCE_FILE,
  DELETE_GITHUB_SAVE_INFO,
  DELETE_PERSISTENCE_FILE,
  DELETE_ALL_GITHUB_SAVE_INFO,
  DELETE_ALL_PERSISTENCE_FILES
 } from './FileSystemTypes';
import { GitHubSaveInfo } from 'src/features/github/GitHubTypes';
import { PersistenceFile } from 'src/features/persistence/PersistenceTypes';

export const setInBrowserFileSystem = (inBrowserFileSystem: FSModule) =>
  action(SET_IN_BROWSER_FILE_SYSTEM, { inBrowserFileSystem });

export const addGithubSaveInfo = (
  githubSaveInfo : GitHubSaveInfo
) => action(ADD_GITHUB_SAVE_INFO, { githubSaveInfo });

export const addPersistenceFile = (
  persistenceFile: PersistenceFile
) => action(ADD_PERSISTENCE_FILE, { persistenceFile });

export const deleteGithubSaveInfo = (
  githubSaveInfo : GitHubSaveInfo
) => action(DELETE_GITHUB_SAVE_INFO, { githubSaveInfo });

export const deletePersistenceFile = (
  persistenceFile: PersistenceFile
) => action(DELETE_PERSISTENCE_FILE, { persistenceFile });

export const deleteAllGithubSaveInfo = () => action(DELETE_ALL_GITHUB_SAVE_INFO);

export const deleteAllPersistenceFiles = () => action(DELETE_ALL_PERSISTENCE_FILES);
