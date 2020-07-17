import GameManager from '../scenes/gameManager/GameManager';
import SourceAcademyGame, { GameType } from '../SourceAcademyGame';
import { mandatory } from '../utils/GameUtils';
import { createEmptySaveState, gameStateToJson, userSettingsToJson } from './GameSaveHelper';
import { loadData, saveData } from './GameSaveRequests';
import { FullSaveState, SettingsJson } from './GameSaveTypes';

/**
 * The manager provides API for loading and saving data from the backend
 * and is in charge of keeping record of the last save point, so that
 * players can make new save data based on the last one.
 */
export default class GameSaveManager {
  private fullSaveState: FullSaveState;

  private chapterNum?: number;
  private checkpointNum?: number;
  private continueGame?: boolean;

  constructor() {
    this.fullSaveState = createEmptySaveState();
  }

  async loadLastSaveState() {
    this.fullSaveState = await loadData();
  }

  public registerGameInfo(chapterNum: number, checkpointNum: number, continueGame: boolean) {
    this.chapterNum = chapterNum;
    this.checkpointNum = checkpointNum;
    this.continueGame = continueGame;
  }

  public async saveGame() {
    if (
      SourceAcademyGame.getInstance().isGameType(GameType.Game) &&
      SourceAcademyGame.getInstance().getCurrentSceneRef() instanceof GameManager
    ) {
      this.fullSaveState = gameStateToJson(
        this.fullSaveState,
        this.getChapterNum(),
        this.getCheckpointNum()
      );
      await saveData(this.fullSaveState);
    }
  }

  public getSettings() {
    return this.fullSaveState.userSaveState.settings;
  }

  public getChapterNum = () => mandatory(this.chapterNum);
  public getCheckpointNum = () => mandatory(this.checkpointNum);
  public getFullSaveState = () => mandatory(this.fullSaveState);

  public async saveSettings(settingsJson: SettingsJson) {
    this.fullSaveState = userSettingsToJson(this.fullSaveState, settingsJson);
    await saveData(this.fullSaveState);
  }

  public getLoadedUserState() {
    return this.fullSaveState.userSaveState;
  }

  public getLoadedGameStoryState() {
    if (this.continueGame) {
      return this.fullSaveState.gameSaveStates[this.getChapterNum()];
    } else {
      return undefined;
    }
  }

  public getLoadedLocation() {
    if (this.continueGame && this.fullSaveState.gameSaveStates[this.getChapterNum()]) {
      return this.fullSaveState.gameSaveStates[this.getChapterNum()].currentLocation;
    } else {
      return;
    }
  }

  public getLoadedPhase() {
    return this.fullSaveState.gameSaveStates[this.getChapterNum()].currentPhase;
  }
}
