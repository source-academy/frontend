import { ItemId } from '../commons/CommonTypes';

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

export interface StateObserver {
  handleAdd: (itemId: ItemId) => any;
  handleDelete: (itemId: ItemId) => boolean;
  handleMutate: (itemId: ItemId) => void;
}
