import { saveData, loadData } from './GameSaveRequests';
import { AccountInfo } from 'src/pages/academy/game/subcomponents/phaserGame';
import { gameStateToJson } from './GameSaveHelper';
import GameActionManager from '../action/GameActionManager';
import { FullSaveState } from './GameSaveTypes';

export default class GameSaveManager {
  private accountInfo: AccountInfo | undefined;
  private loadedGameState: FullSaveState;
  private chapterNum: number;

  constructor() {
    this.loadedGameState = {
      gameSaveStates: {},
      userState: {
        collectibles: [],
        achievements: [],
        settings: { volume: 0 },
        lastPlayedChapter: -1
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
