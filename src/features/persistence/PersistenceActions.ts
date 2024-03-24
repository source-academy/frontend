import { createAction } from '@reduxjs/toolkit';

import {
  PERSISTENCE_INITIALISE,
  PERSISTENCE_OPEN_PICKER,
  PERSISTENCE_SAVE_FILE,
  PERSISTENCE_SAVE_FILE_AS,
  PersistenceFile
} from './PersistenceTypes';

export const persistenceOpenPicker = createAction(PERSISTENCE_OPEN_PICKER, () => ({ payload: {} }));

export const persistenceSaveFile = createAction(PERSISTENCE_SAVE_FILE, (file: PersistenceFile) => ({
  payload: file
}));

export const persistenceSaveFileAs = createAction(PERSISTENCE_SAVE_FILE_AS, () => ({
  payload: {}
}));

export const persistenceInitialise = createAction(PERSISTENCE_INITIALISE, () => ({ payload: {} }));
