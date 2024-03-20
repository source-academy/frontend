import { FSModule } from 'browserfs/dist/node/core/FS';
import { action } from 'typesafe-actions';

import { 
  SET_IN_BROWSER_FILE_SYSTEM,
  ADD_GITHUB_SAVE_INFO,
  DELETE_GITHUB_SAVE_INFO,
  DELETE_ALL_GITHUB_SAVE_INFO
 } from './FileSystemTypes';
import { GitHubSaveInfo } from 'src/features/github/GitHubTypes';

export const setInBrowserFileSystem = (inBrowserFileSystem: FSModule) =>
  action(SET_IN_BROWSER_FILE_SYSTEM, { inBrowserFileSystem });

export const addGithubSaveInfo = (
  githubSaveInfo : GitHubSaveInfo
) => action(ADD_GITHUB_SAVE_INFO, { githubSaveInfo });

export const deleteGithubSaveInfo = (
  githubSaveInfo : GitHubSaveInfo
) => action(DELETE_GITHUB_SAVE_INFO, { githubSaveInfo });

export const deleteAllGithubSaveInfo = () => action(DELETE_ALL_GITHUB_SAVE_INFO);
