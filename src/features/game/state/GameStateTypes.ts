import { LocationId } from '../location/GameMapTypes';

export enum GameStateStorage {
  UserState = 'UserState',
  ChecklistState = 'ChecklistState'
}

export type UserState = {
  collectibles: string[];
  assessments?: string[];
};

export type StateObserver = {
  observerId: string;
  notify: (locationId: LocationId) => void;
};

export type StateSubject = {
  subscribers: Array<StateObserver>;
  update: (locationId: LocationId) => void;
  subscribe: (observer: StateObserver) => void;
  unsubscribe: (observer: StateObserver) => void;
};
