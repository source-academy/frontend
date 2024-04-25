import { createAction } from '@reduxjs/toolkit';

import {
  GITHUB_CREATE_FILE,
  GITHUB_DELETE_FILE,
  GITHUB_DELETE_FOLDER,
  GITHUB_OPEN_FILE,
  GITHUB_RENAME_FILE,
  GITHUB_RENAME_FOLDER,
  GITHUB_SAVE_ALL,
  GITHUB_SAVE_FILE,
  GITHUB_SAVE_FILE_AS
} from './GitHubTypes';

export const githubOpenFile = createAction(GITHUB_OPEN_FILE, () => ({ payload: {} }));

export const githubSaveFile = createAction(GITHUB_SAVE_FILE, () => ({ payload: {} }));

export const githubSaveFileAs = createAction(GITHUB_SAVE_FILE_AS, () => ({ payload: {} }));

export const githubSaveAll = createAction(GITHUB_SAVE_ALL, () => ({ payload: {} }));

export const githubCreateFile = createAction(GITHUB_CREATE_FILE, (filePath: string) => ({
  payload: filePath
}));

export const githubDeleteFile = createAction(GITHUB_DELETE_FILE, (filePath: string) => ({
  payload: filePath
}));

export const githubDeleteFolder = createAction(GITHUB_DELETE_FOLDER, (filePath: string) => ({
  payload: filePath
}));

export const githubRenameFile = createAction(
  GITHUB_RENAME_FILE,
  (oldFilePath: string, newFilePath: string) => ({ payload: { oldFilePath, newFilePath } })
);

export const githubRenameFolder = createAction(
  GITHUB_RENAME_FOLDER,
  (oldFilePath: string, newFilePath: string) => ({ payload: { oldFilePath, newFilePath } })
);
