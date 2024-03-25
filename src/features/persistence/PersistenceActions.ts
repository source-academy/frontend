import { action } from 'typesafe-actions';

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

export const persistenceOpenPicker = () => action(PERSISTENCE_OPEN_PICKER);

export const persistenceSaveAll = () => action(PERSISTENCE_SAVE_ALL);

export const persistenceSaveFile = (file: PersistenceFile) => action(PERSISTENCE_SAVE_FILE, file);

export const persistenceSaveFileAs = () => action(PERSISTENCE_SAVE_FILE_AS);

export const persistenceCreateFile = (newFilePath: string) => action(PERSISTENCE_CREATE_FILE, newFilePath);

export const persistenceCreateFolder = (newFolderPath: string) => action(PERSISTENCE_CREATE_FOLDER, newFolderPath);

export const persistenceDeleteFile = (filePath: string) => action(PERSISTENCE_DELETE_FILE, filePath);

export const persistenceDeleteFolder = (folderPath: string) => action(PERSISTENCE_DELETE_FOLDER, folderPath);

export const persistenceRenameFile = 
  (filePaths: {oldFilePath: string, newFilePath: string}) => action(PERSISTENCE_RENAME_FILE, filePaths);

  export const persistenceRenameFolder = 
  (folderPaths: {oldFolderPath: string, newFolderPath: string}) => action(PERSISTENCE_RENAME_FOLDER, folderPaths);

export const persistenceInitialise = () => action(PERSISTENCE_INITIALISE);
