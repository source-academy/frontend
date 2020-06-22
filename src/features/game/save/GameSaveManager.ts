import { saveData, loadData } from './GameSaveRequests';
import { AccountInfo } from 'src/pages/academy/game/subcomponents/phaserGame';
import { gameStateToJson, userSettingsToJson } from './GameSaveHelper';
import GameActionManager from '../action/GameActionManager';
import { FullSaveState, SettingsJson } from './GameSaveTypes';

export default class GameSaveManager {
  private accountInfo: AccountInfo | undefined;
  private fullSaveState: FullSaveState;
  private chapterNum: number;

  constructor() {
    this.fullSaveState = {
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
    const fullSaveState = await loadData(this.getAccountInfo());
    this.fullSaveState = fullSaveState;
  }

  public async saveGame() {
    const gameStateManager = GameActionManager.getInstance().getGameManager().stateManager;
    const userStateManager = GameActionManager.getInstance().getGameManager().userStateManager;

    this.fullSaveState = gameStateToJson(
      this.fullSaveState,
      this.chapterNum,
      gameStateManager,
      userStateManager
    );

    await saveData(this.getAccountInfo(), this.fullSaveState);
  }

  public async saveSettings(settingsJson: SettingsJson) {
    this.fullSaveState = userSettingsToJson(this.fullSaveState, settingsJson);

    await saveData(this.getAccountInfo(), this.fullSaveState);
  }

  public getLoadedUserState() {
    return this.fullSaveState.userState;
  }

  public getLoadedGameStoryState() {
    return this.fullSaveState.gameSaveStates[this.chapterNum];
  }

  private getAccountInfo() {
    if (!this.accountInfo) {
      throw new Error('No account info');
    }
    return this.accountInfo;
  }
}
