import { saveData, loadData } from './serverContact';
import { AccountInfo } from '../scenes/chapterSelect/ChapterSelect';
import { gameStateToJson, FullGameState } from './JsonifyGameState';
import GameActionManager from '../action/GameActionManager';

export class GameSaveManager {
  private accountInfo: AccountInfo | undefined;
  private fullGameState: FullGameState;
  private chapterNum: number;

  constructor() {
    this.fullGameState = {
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
    this.fullGameState = fullGameState;
  }

  public saveGame() {
    const gameStateManager = GameActionManager.getInstance().getGameManager().stateManager;
    const userStateManager = GameActionManager.getInstance().getGameManager().userStateManager;
    saveData(
      this.getAccountInfo(),
      gameStateToJson(this.fullGameState, this.chapterNum, gameStateManager, userStateManager)
    );
  }

  public getLoadedUserState() {
    return this.fullGameState.userState;
  }

  public getLoadedGameStoryState() {
    return this.fullGameState.gameStoryStates[this.chapterNum];
  }

  private getAccountInfo() {
    if (!this.accountInfo) {
      throw new Error('No account info');
    }
    return this.accountInfo;
  }
}
