import { UserState } from './GameStateTypes';
import { DefaultUserState } from './SampleUserState';

export default class GameUserStateManager {
  private userState: UserState;

  constructor() {
    this.userState = DefaultUserState;
  }

  public initialise(userState: UserState) {
    this.userState = userState;
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
