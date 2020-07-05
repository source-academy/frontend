import { UserState } from './GameStateTypes';
import { emptyUserState } from './GameStateConstants';
import { UserSaveState } from '../save/GameSaveTypes';

export default class GameUserStateManager {
  private userState: UserState;

  constructor(userState: UserSaveState) {
    this.userState = userState || emptyUserState;
  }

  public addToList(listName: string, id: string): void {
    this.userState[listName].push(id);
  }

  public getList(listName: string): string[] {
    return this.userState[listName];
  }

  public doesIdExistInList(listName: string, id: string): boolean {
    return this.userState[listName].includes(id);
  }
}
