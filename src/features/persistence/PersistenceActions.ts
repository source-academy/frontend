import { action } from 'typesafe-actions';

import {
  PERSISTENCE_INITIALISE,
  PERSISTENCE_OPEN_PICKER,
  PERSISTENCE_SAVE_ALL,
  PERSISTENCE_SAVE_FILE,
  PERSISTENCE_SAVE_FILE_AS,
  PersistenceObject
} from './PersistenceTypes';

export const persistenceOpenPicker = () => action(PERSISTENCE_OPEN_PICKER);

export const persistenceSaveAll = () => action(PERSISTENCE_SAVE_ALL);

export const persistenceSaveFile = (file: PersistenceObject) => action(PERSISTENCE_SAVE_FILE, file);

export const persistenceSaveFileAs = () => action(PERSISTENCE_SAVE_FILE_AS);

export const persistenceInitialise = () => action(PERSISTENCE_INITIALISE);
