import { saveData, loadData } from './GameSaveRequests';
import { AccountInfo } from '../scenes/chapterSelect/ChapterSelect';
import { gameStateToJson, FullGameState } from './GameSaveHelper';
import GameActionManager from '../action/GameActionManager';

export class GameSaveManager {
  private accountInfo: AccountInfo | undefined;
  private loadedGameState: FullGameState;
  private chapterNum: number;

  constructor() {
    this.loadedGameState = {
      gameStoryStates: {},
      userState: {
        collectibles: [],
        achievements: []
      }
    } as FullGameState;

    this.chapterNum = -1;
  }

  public async initialise(accountInfo: AccountInfo, chapterNum: number) {
    this.accountInfo = accountInfo;
    this.chapterNum = chapterNum;
    const fullGameState = await loadData(this.getAccountInfo());
    this.loadedGameState = fullGameState;
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
    return this.loadedGameState.gameStoryStates[this.chapterNum];
  }

  private getAccountInfo() {
    if (!this.accountInfo) {
      throw new Error('No account info');
    }
    return this.accountInfo;
  }
}
