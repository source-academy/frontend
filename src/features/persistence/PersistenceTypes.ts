export const PERSISTENCE_OPEN_PICKER = 'PERSISTENCE_OPEN_PICKER';
export const PERSISTENCE_SAVE_ALL = 'PERSISTENCE_SAVE_ALL';
export const PERSISTENCE_SAVE_FILE_AS = 'PERSISTENCE_SAVE_FILE_AS';
export const PERSISTENCE_SAVE_FILE = 'PERSISTENCE_SAVE_FILE';
export const PERSISTENCE_INITIALISE = 'PERSISTENCE_INITIALISE';

export type PersistenceState = 'INACTIVE' | 'SAVED' | 'DIRTY';

export type PersistenceObject = {
  id: string;
  name: string;
  lastSaved?: Date;
  isFolder?: boolean;
  modifiedFiles?: string[];
  addedFiles?: string[];
  removedFiles?: string[];
  addedFolders?: string[];
  removedFolders?: string[];
};