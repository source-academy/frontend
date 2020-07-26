import { LocationId } from '../location/GameMapTypes';

export enum GameStateStorage {
  UserState = 'UserState',
  ChecklistState = 'ChecklistState'
}

/**
 * Type of user state list.
 */
export enum UserStateTypes {
  collectibles = 'collectibles',
  assessments = 'assessments',
  achievements = 'achievements'
}

/**
 * Encapsulate all user state lists.
 */
export type UserState = {
  [K in UserStateTypes]?: string[];
};

/**
 * Represent the changes done to the state.
 */
export enum StateChangeType {
  Add,
  Mutate,
  Delete
}

/**
 * Observer pattern, the observer side.
 */
export type StateObserver = {
  observerId: string;
  notify: (changeType: StateChangeType, locationId: LocationId, id?: string) => void;
};

/**
 * Observer pattern, the subject side.
 */
export type StateSubject = {
  subscribers: Array<StateObserver>;
  update: (changeType: StateChangeType, locationId: LocationId, id?: string) => void;
  subscribe: (observer: StateObserver) => void;
  unsubscribe: (observer: StateObserver) => void;
};
