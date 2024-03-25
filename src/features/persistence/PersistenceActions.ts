import { createAction } from '@reduxjs/toolkit';

import {
  PERSISTENCE_INITIALISE,
  PERSISTENCE_OPEN_PICKER,
  PERSISTENCE_SAVE_ALL,
  PERSISTENCE_SAVE_FILE,
  PERSISTENCE_SAVE_FILE_AS,
  PERSISTENCE_CREATE_FILE,
  PERSISTENCE_CREATE_FOLDER,
  PERSISTENCE_DELETE_FILE,
  PERSISTENCE_DELETE_FOLDER,
  PERSISTENCE_RENAME_FILE,
  PERSISTENCE_RENAME_FOLDER,
  PersistenceFile
} from './PersistenceTypes';

export const persistenceOpenPicker = createAction(PERSISTENCE_OPEN_PICKER, () => ({ payload: {} }));

export const persistenceSaveAll = createAction(PERSISTENCE_SAVE_ALL, () => ({ payload: {} }));

export const persistenceSaveFile = createAction(PERSISTENCE_SAVE_FILE, (file: PersistenceFile) => ({
  payload: file
}));

export const persistenceSaveFileAs = createAction(PERSISTENCE_SAVE_FILE_AS, () => ({
  payload: {}
}));

export const persistenceCreateFile = createAction(
  PERSISTENCE_CREATE_FILE,
  (newFilePath: string) => ({payload: newFilePath})
);

export const persistenceCreateFolder = createAction(
  PERSISTENCE_CREATE_FOLDER,
  (newFolderPath: string) => ({payload: newFolderPath})
);

export const persistenceDeleteFile = createAction(
  PERSISTENCE_DELETE_FILE,
  (filePath: string) => ({payload: filePath})
);

export const persistenceDeleteFolder = createAction(
  PERSISTENCE_DELETE_FOLDER,
  (folderPath: string) => ({payload: folderPath})
);

export const persistenceRenameFile = createAction(
  PERSISTENCE_RENAME_FILE,
  (filePaths: {oldFilePath: string, newFilePath: string}) => ({payload: filePaths})
);

export const persistenceRenameFolder = createAction(
  PERSISTENCE_RENAME_FOLDER,
  (folderPaths: {oldFolderPath: string, newFolderPath: string}) => ({payload: folderPaths})
);

export const persistenceInitialise = createAction(PERSISTENCE_INITIALISE, () => ({ payload: {} }));
