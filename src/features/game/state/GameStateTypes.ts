import { ItemId } from '../commons/CommonTypes';

export enum GameStateStorage {
  UserState = 'UserState',
  ChecklistState = 'ChecklistState',
  TasklistState = 'TasklistState',
  AttemptedQuizState = 'AttemptedQuizState',
  PassedQuizState = 'PassedQuizState',
  QuizScoreState = 'QuizScoreState'
}

/**
 * Type of user state list.
 */
export enum UserStateType {
  collectibles = 'collectibles',
  assessments = 'assessments',
  achievements = 'achievements'
}

/**
 * State observer is a renderer that can reflect the changes
 * to the current scene
 */
export interface StateObserver {
  handleAdd: (itemId: ItemId) => boolean;
  handleDelete: (itemId: ItemId) => boolean;
  handleMutate: (itemId: ItemId) => boolean;
}
