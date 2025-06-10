export type PersistenceState = 'INACTIVE' | 'SAVED' | 'DIRTY';

export type PersistenceFile = {
  id: string;
  name: string;
  lastSaved?: Date;
};
