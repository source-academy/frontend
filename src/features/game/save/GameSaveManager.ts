import { saveData, loadData } from './GameSaveRequests';
import { AccountInfo } from 'src/pages/academy/game/subcomponents/phaserGame';
import { gameStateToJson, userSettingsToJson } from './GameSaveHelper';
import { FullSaveState, SettingsJson } from './GameSaveTypes';

export default class GameSaveManager {
  private accountInfo: AccountInfo | undefined;
  private fullSaveState: FullSaveState;
  private chapterNum: number;
  private checkpointNum: number;

  constructor() {
    this.fullSaveState = {
      gameSaveStates: {},
      userState: {
        collectibles: [],
        achievements: [],
        settings: { volume: 1 },
        lastPlayedCheckpoint: [-1, -1]
      }
    } as FullSaveState;

    this.chapterNum = -1;
    this.checkpointNum = -1;
  }

  public async initialise(accountInfo: AccountInfo, chapterNum?: number, checkpointNum?: number) {
    this.accountInfo = accountInfo;
    this.chapterNum = chapterNum === undefined ? -1 : chapterNum;
    this.checkpointNum = checkpointNum === undefined ? -1 : checkpointNum;
    const fullSaveState = await loadData(this.getAccountInfo());
    this.fullSaveState = fullSaveState;
  }

  public async saveGame() {
    this.fullSaveState = gameStateToJson(this.fullSaveState, this.chapterNum, this.checkpointNum);
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

  public getLoadedLocation() {
    return this.fullSaveState.gameSaveStates[this.chapterNum].currentLocation;
  }

  public getLoadedPhase() {
    return this.fullSaveState.gameSaveStates[this.chapterNum].currentPhase;
  }

  private getAccountInfo() {
    if (!this.accountInfo) {
      throw new Error('No account info');
    }
    return this.accountInfo;
  }
}
