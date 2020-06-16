import { saveData } from './serverContact';
import { AccountInfo } from '../scenes/chapterSelect/ChapterSelect';
import { gameStateToJson } from './JsonifyGameState';
import GameActionManager from '../action/GameActionManager';

export class GameSaveManager {
  private accountInfo: AccountInfo | undefined;

  public initialise(accountInfo: AccountInfo) {
    this.accountInfo = accountInfo;
  }

  public saveGame() {
    if (!this.accountInfo) {
      return;
    }
    const gameStateManager = GameActionManager.getInstance().getGameManager().stateManager;
    const userStateManager = GameActionManager.getInstance().getGameManager().userStateManager;
    saveData(this.accountInfo, gameStateToJson(gameStateManager, userStateManager));
  }
}
