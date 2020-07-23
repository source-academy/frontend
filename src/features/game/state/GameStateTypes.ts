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

/**
 * State observer is a renderer that can reflect the changes
 * to the current scene
 */
export interface StateObserver {
  handleAdd: (itemId: ItemId) => boolean;
  handleDelete: (itemId: ItemId) => boolean;
  handleMutate: (itemId: ItemId) => boolean;
}
