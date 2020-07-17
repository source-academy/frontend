import SourceAcademyGame, {
  GameType
} from 'src/pages/academy/game/subcomponents/SourceAcademyGame';

import { Constants } from '../commons/CommonConstants';
import { gameStateToJson, userSettingsToJson } from './GameSaveHelper';
import { saveData } from './GameSaveRequests';
import { FullSaveState, SettingsJson } from './GameSaveTypes';
import { SettingsSaveManager } from './GameSettingsSaveManager';

export type SaveManagerProps = {
  fullSaveState: FullSaveState;
  chapterNum: number;
  checkpointNum: number;
  continueGame: boolean;
};

/**
 * The manager provides API for loading and saving data from the backend
 * and is in charge of keeping record of the last save point, so that
 * players can make new save data based on the last one.
 */
export default class GameSaveManager implements SettingsSaveManager {
  private fullSaveState: FullSaveState;
  private chapterNum: number;
  private checkpointNum: number;
  private continueGame: boolean;

  constructor({ fullSaveState, chapterNum, checkpointNum, continueGame }: SaveManagerProps) {
    this.chapterNum = chapterNum;
    this.checkpointNum = checkpointNum;
    this.fullSaveState = fullSaveState;
    this.continueGame = continueGame;
  }

  public async saveGame() {
    if (SourceAcademyGame.getInstance().isGameType(GameType.Game)) {
      this.fullSaveState = gameStateToJson(this.fullSaveState, this.chapterNum, this.checkpointNum);
      await saveData(this.fullSaveState);
    }
  }

  public loadSettings = Constants.nullFunction;

  public getSettings() {
    return this.fullSaveState.userSaveState.settings;
  }

  public async saveSettings(settingsJson: SettingsJson) {
    this.fullSaveState = userSettingsToJson(this.fullSaveState, settingsJson);
    await saveData(this.fullSaveState);
  }

  public getLoadedUserState() {
    return this.fullSaveState.userSaveState;
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
}
