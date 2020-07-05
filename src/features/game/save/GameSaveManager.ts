import { saveData } from './GameSaveRequests';
import { AccountInfo } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';
import { gameStateToJson, userSettingsToJson } from './GameSaveHelper';
import { FullSaveState, SettingsJson, SaveManagerType } from './GameSaveTypes';
import { emptySaveState } from './GameSaveConstants';

export default class GameSaveManager {
  private accountInfo: AccountInfo | undefined;
  private fullSaveState: FullSaveState;
  private chapterNum: number;
  private checkpointNum: number;
  private continueGame: boolean;
  private version: SaveManagerType;

  constructor() {
    this.fullSaveState = emptySaveState;
    this.chapterNum = -1;
    this.checkpointNum = -1;
    this.continueGame = false;
    this.version = SaveManagerType.None;
  }

  public async initialiseForGame(
    accountInfo: AccountInfo,
    fullSaveState: FullSaveState | undefined,
    chapterNum: number,
    checkpointNum: number,
    continueGame: boolean
  ) {
    if (accountInfo.role !== 'student') {
      throw Error('This initalisation method is for students playing games');
    }
    this.accountInfo = accountInfo;
    this.chapterNum = chapterNum;
    this.checkpointNum = checkpointNum;
    if (!fullSaveState) {
      throw Error('No loaded state');
    }
    this.fullSaveState = fullSaveState;
    this.continueGame = continueGame;
    this.version = SaveManagerType.Game;
  }

  public async initialiseForSettings(
    accountInfo: AccountInfo,
    fullSaveState: FullSaveState | undefined
  ) {
    this.accountInfo = accountInfo;
    if (!fullSaveState) {
      throw Error('No loaded state');
    }
    this.fullSaveState = fullSaveState;
    this.continueGame = false;
    this.version = SaveManagerType.Settings;
  }

  public async initialiseForStaff(accountInfo: AccountInfo) {
    if (accountInfo.role !== 'staff') {
      throw Error('This initalisation method is for staff testing simulator');
    }
    this.accountInfo = accountInfo;
    this.version = SaveManagerType.Simulator;
  }

  public async saveGame(completedChapter = false) {
    if (this.version === SaveManagerType.Game) {
      this.fullSaveState = gameStateToJson(this.fullSaveState, this.chapterNum, this.checkpointNum);
      await saveData(this.getAccountInfo(), this.fullSaveState);
    } else if (this.version === SaveManagerType.Simulator) {
      return;
    } else {
      throw new Error('Only used during gameplay');
    }
  }

  public async saveSettings(settingsJson: SettingsJson) {
    if (this.version !== SaveManagerType.Settings) {
      throw new Error('Only used for saving settings');
    }
    this.fullSaveState = userSettingsToJson(this.fullSaveState, settingsJson);
    await saveData(this.getAccountInfo(), this.fullSaveState);
  }

  public getLoadedUserState() {
    return this.fullSaveState.userState;
  }

  public getLoadedGameStoryState() {
    if (this.continueGame) {
      return this.fullSaveState.gameSaveStates[this.chapterNum];
    } else {
      return undefined;
    }
  }

  public getLoadedLocation() {
    if (this.continueGame && this.fullSaveState.gameSaveStates[this.chapterNum]) {
      return this.fullSaveState.gameSaveStates[this.chapterNum].currentLocation;
    } else {
      return;
    }
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
