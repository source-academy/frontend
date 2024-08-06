import GameManager from '../scenes/gameManager/GameManager';
import SourceAcademyGame from '../SourceAcademyGame';
import { mandatory } from '../utils/GameUtils';
import { createEmptyGameSaveState, createEmptySaveState, gameStateToJson } from './GameSaveHelper';
import { loadData, saveData } from './GameSaveRequests';
import { FullSaveState, GameSaveState, SettingsJson } from './GameSaveTypes';

/**
 * The manager provides API for loading and saving data from the backend
 * and is in charge of keeping record of the last save point, so that
 * players can make new save data based on the last one.
 */
export default class GameSaveManager {
  private fullSaveState: FullSaveState;

  private chapterNum?: number;
  private checkpointNum?: number;

  constructor() {
    this.fullSaveState = createEmptySaveState();
  }

  /**
   * Fetches the FullSaveState of the student at the start of the game
   * and stores this internally as full save state
   */
  public async loadLastSaveState() {
    this.fullSaveState = await loadData();
  }

  /**
   * Updates the save manager with chapter number and checkpoint number
   * if player has chosen a chapter/checkpoint to play with.
   *
   * Chapter number and checkpoint number can be -1 if inside the Game Simulator,
   *
   * @param chapterNum chapter number
   * @param checkpointNum checkpoint number
   * @param continueGame whether user wants to continue or restart the chapter.
   */
  public registerGameInfo(chapterNum: number, checkpointNum: number, continueGame: boolean) {
    this.chapterNum = chapterNum;
    this.checkpointNum = checkpointNum;
    if (!continueGame) {
      this.fullSaveState.gameSaveStates[chapterNum] = createEmptyGameSaveState();
    }
  }

  ///////////////////////////////
  //          Saving          //
  ///////////////////////////////

  /**
   * Save the current game state as a JSON 'snapshot' to the backend.
   * Can only be called inside the GameManager scene because this function retrieves
   * informtion from GameManager, GameStateManager, or other in-game managers,
   * and converts them into JSON format to be saved to backend.
   *
   * Only called when playing the Game (not Game Simulator), because Game Simulator
   * shouldn't save game state to backend.
   */
  public async saveGame() {
    if (SourceAcademyGame.getInstance().getCurrentSceneRef() instanceof GameManager) {
      this.fullSaveState = gameStateToJson(
        this.fullSaveState,
        this.getChapterNum(),
        this.getCheckpointNum()
      );
      await saveData(this.fullSaveState);
    }
  }

  /**
   * This function is called during CheckpointTransition to update
   * and save that largest chapter that the player has completed
   * so far.
   *
   * @param completedChapter the number of the completed chapter
   */
  public async saveChapterComplete(completedChapter: number) {
    this.fullSaveState.gameSaveStates[completedChapter].chapterNewlyCompleted = true;
    if (completedChapter > this.getLargestCompletedChapterNum()) {
      this.fullSaveState.userSaveState.largestCompletedChapter = completedChapter;
    }
    await saveData(this.fullSaveState);
  }

  /**
   * This function is called by the Escape Manager and Settings scene
   * to store new user settings to the backend
   *
   * @param settingsJson the newest settings of the user
   */
  public async saveSettings(settingsJson: SettingsJson) {
    this.fullSaveState.userSaveState.settings = settingsJson;
    await saveData(this.fullSaveState);
  }

  ///////////////////////////////
  //         Getters           //
  ///////////////////////////////

  /**
   * Obtains user settings from full save state
   *
   * @returns User settings
   */
  public getSettings(): SettingsJson {
    return this.fullSaveState.userSaveState.settings;
  }

  /**
   * Obtains user state from full save state
   */
  public getLoadedUserState() {
    return this.fullSaveState.userSaveState;
  }

  /**
   * Obtains the largest completed chapter number by the player
   */
  public getLargestCompletedChapterNum(): number {
    return this.fullSaveState.userSaveState.largestCompletedChapter;
  }

  /**
   * Gets user's gamestate for this chapter
   */
  public getGameSaveState(): GameSaveState {
    return this.fullSaveState.gameSaveStates[this.getChapterNum()] || createEmptyGameSaveState();
  }

  /**
   * Gets user's location for this chapter if chapter has been created
   */
  public getLoadedLocation() {
    return this.getGameSaveState().currentLocation;
  }
  /**
   * Returns the save state for a particular chapter, if no data, then create an empty save state
   */
  public getChapterSaveState(index: number) {
    return this.fullSaveState.gameSaveStates[index] || createEmptyGameSaveState();
  }

  public getTriggeredStateChangeActions = () => this.getGameSaveState().triggeredStateChangeActions;
  public getTriggeredInteractions = () => this.getGameSaveState().triggeredInteractions;
  public getCompletedObjectives = () => this.getGameSaveState().completedObjectives;
  public getCompletedTasks = () => this.getGameSaveState().completedTasks;
  public getIncompleteTasks = () => this.getGameSaveState().incompleteTasks;
  public getLoadedPhase = () => this.getGameSaveState().currentPhase;
  public getChapterNewlyCompleted = () => this.getGameSaveState().chapterNewlyCompleted;
  public getQuizScores = () => this.getGameSaveState().quizScores;

  public getChapterNum = () => mandatory(this.chapterNum);
  public getCheckpointNum = () => mandatory(this.checkpointNum);
  public getFullSaveState = () => this.fullSaveState;
}
