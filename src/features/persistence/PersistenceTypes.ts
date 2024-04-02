export const PERSISTENCE_OPEN_PICKER = 'PERSISTENCE_OPEN_PICKER';
export const PERSISTENCE_SAVE_ALL = 'PERSISTENCE_SAVE_ALL';
export const PERSISTENCE_SAVE_FILE_AS = 'PERSISTENCE_SAVE_FILE_AS';
export const PERSISTENCE_SAVE_FILE = 'PERSISTENCE_SAVE_FILE';
export const PERSISTENCE_INITIALISE = 'PERSISTENCE_INITIALISE';
export const PERSISTENCE_CREATE_FILE = 'PERSISTENCE_CREATE_FILE';
export const PERSISTENCE_CREATE_FOLDER = 'PERSISTENCE_CREATE_FOLDER';
export const PERSISTENCE_DELETE_FILE = 'PERSISTENCE_DELETE_FILE';
export const PERSISTENCE_DELETE_FOLDER = 'PERSISTENCE_DELETE_FOLDER';
export const PERSISTENCE_RENAME_FILE = 'PERSISTENCE_RENAME_FILE';
export const PERSISTENCE_RENAME_FOLDER = 'PERSISTENCE_RENAME_FOLDER';

export type PersistenceState = 'INACTIVE' | 'SAVED' | 'DIRTY';

export type PersistenceFile = {
  id: string;
  parentId?: string; // only relevant for isFolder = true
  name: string;
  path?: string; // only for persistenceFileArray
  lastSaved?: Date;
  lastEdit?: Date;
  isFolder?: boolean;
};