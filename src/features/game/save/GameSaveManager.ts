import { saveData, loadData } from './GameSaveRequests';
import { AccountInfo } from '../scenes/chapterSelect/ChapterSelect';
import { gameStateToJson } from './GameSaveHelper';
import GameActionManager from '../action/GameActionManager';
import { FullSaveState } from './GameSaveTypes';

export class GameSaveManager {
  private accountInfo: AccountInfo | undefined;
  private loadedGameState: FullSaveState;
  private chapterNum: number;

  constructor() {
    this.loadedGameState = {
      gameSaveStates: {},
      userState: {
        collectibles: [],
        achievements: []
      }
    } as FullSaveState;

    this.chapterNum = -1;
  }

  public async initialise(accountInfo: AccountInfo, chapterNum: number) {
    this.accountInfo = accountInfo;
    this.chapterNum = chapterNum;
    const loadedGameState = await loadData(this.getAccountInfo());
    this.loadedGameState = loadedGameState;
  }

  public async saveGame() {
    const gameStateManager = GameActionManager.getInstance().getGameManager().stateManager;
    const userStateManager = GameActionManager.getInstance().getGameManager().userStateManager;

    await saveData(
      this.getAccountInfo(),
      gameStateToJson(this.loadedGameState, this.chapterNum, gameStateManager, userStateManager)
    );
  }

  public getLoadedUserState() {
    return this.loadedGameState.userState;
  }

  public getLoadedGameStoryState() {
    return this.loadedGameState.gameSaveStates[this.chapterNum];
  }

  private getAccountInfo() {
    if (!this.accountInfo) {
      throw new Error('No account info');
    }
    return this.accountInfo;
  }
}
