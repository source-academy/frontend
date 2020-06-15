export enum GameStateStorage {
  UserState = 'UserState',
  ChecklistState = 'ChecklistState'
}

export type UserState = {
  collectibles: string[];
  achievements: string[];
};
