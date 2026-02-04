import { BBoxProperty } from '../boundingBoxes/GameBoundingBoxTypes';
import { GameCheckpoint } from '../chapter/GameChapterTypes';
import { GamePosition, ItemId } from '../commons/CommonTypes';
import GameMap from '../location/GameMap';
import { GameItemType, LocationId } from '../location/GameMapTypes';
import { GameMode } from '../mode/GameModeTypes';
import GameObjective from '../objective/GameObjective';
import { ObjectProperty } from '../objects/GameObjectTypes';
import { convertMapToArray } from '../save/GameSaveHelper';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import SourceAcademyGame from '../SourceAcademyGame';
import GameTask from '../task/GameTask';
import { TaskDetail } from '../task/GameTaskTypes';
import { mandatory } from '../utils/GameUtils';
import { StateObserver } from './GameStateTypes';

/**
 * Manages all states related to story, chapter, or checkpoint;
 * e.g. checkpoint objectives, objects' property, bboxes' property.
 *
 * Other than this manager, all other manager should not need to
 * manage their own state.
 *
 * Employs observer pattern, and notifies its subjects on state update.
 */

class GameStateManager {
  // Subscribers
  private subscribers: Map<GameItemType, StateObserver>;

  // Game State
  private gameMap: GameMap;
  private checkpointObjective: GameObjective;
  private checkpointTask: GameTask;
  private chapterNewlyCompleted: boolean;
  private quizScores: Map<ItemId, number>;

  // Triggered Interactions
  private updatedLocations: Set<LocationId>;
  private triggeredInteractions: Map<ItemId, boolean>;
  private triggeredStateChangeActions: ItemId[];

  constructor(gameCheckpoint: GameCheckpoint) {
    this.subscribers = new Map<GameItemType, StateObserver>();

    this.gameMap = gameCheckpoint.map;
    this.checkpointObjective = gameCheckpoint.objectives;
    this.checkpointTask = gameCheckpoint.tasks;
    this.chapterNewlyCompleted = false;
    this.quizScores = new Map<ItemId, number>();

    this.updatedLocations = new Set(this.gameMap.getLocationIds());
    this.triggeredInteractions = new Map<ItemId, boolean>();
    this.triggeredStateChangeActions = [];

    this.loadStatesFromSaveManager();
  }

  /**
   * Loads some game states from the save manager
   */
  private loadStatesFromSaveManager() {
    this.triggeredStateChangeActions = this.getSaveManager().getTriggeredStateChangeActions();

    this.getSaveManager()
      .getTriggeredInteractions()
      .forEach(interactionId => this.triggerInteraction(interactionId));

    this.getSaveManager()
      .getCompletedObjectives()
      .forEach(objective => this.checkpointObjective.setObjective(objective, true));

    this.getSaveManager()
      .getCompletedTasks()
      .forEach(task => {
        this.checkpointTask.setTask(task, true);
        this.checkpointTask.showTask(task);
      });

    this.getSaveManager()
      .getIncompleteTasks()
      .forEach(task => {
        this.checkpointTask.setTask(task, false);
        this.checkpointTask.showTask(task);
      });

    this.quizScores = new Map(this.getSaveManager().getQuizScores());

    this.chapterNewlyCompleted = this.getSaveManager().getChapterNewlyCompleted();
  }

  ///////////////////////////////
  //        Subscribers        //
  ///////////////////////////////

  /**
   * This function is called to set state observers
   *
   * @param gameItemType Type of game item the observer wants to watch
   * @param stateObserver reference to state observer
   */
  public watchGameItemType(gameItemType: GameItemType, stateObserver: StateObserver) {
    this.subscribers.set(gameItemType, stateObserver);
  }

  /**
   * Obtains the subscriber that watches the game item
   *
   * @param gameItemType the type of item being watched
   */
  private getSubscriberForItemType(gameItemType: GameItemType) {
    return this.subscribers.get(gameItemType);
  }

  ///////////////////////////////
  //        Interaction        //
  ///////////////////////////////

  /**
   * Record that an interaction has been triggered.
   *
   * @param id id of interaction
   */
  public triggerInteraction(id: string): void {
    this.triggeredInteractions.set(id, true);
  }

  /**
   * Record a state-change action that has been triggered.
   * State-change actions refer to actions that modify the map's
   * original state
   *
   * @param actionId actionId of interaction
   */
  public triggerStateChangeAction(actionId: ItemId): void {
    this.triggeredStateChangeActions.push(actionId);
  }

  /**
   * Checks whether an interaction ID has been triggered or not.
   *
   * @param id id of interaction
   * @returns {boolean}
   */
  public hasTriggeredInteraction(id: string): boolean | undefined {
    return this.triggeredInteractions.get(id);
  }

  ///////////////////////////////
  //          Notifs          //
  ///////////////////////////////

  /**
   * Adds a location notification for a locationId
   *
   * @param locationId locationId of location you want to add notif to
   */
  public addLocationNotif(locationId: LocationId) {
    this.updatedLocations.add(locationId);
  }

  /**
   * Removes a location notification for a locationId
   *
   * @param locationId locationId of location you want to remove notif of
   */
  public removeLocationNotif(locationId: LocationId) {
    this.updatedLocations.delete(locationId);
  }

  /**
   * Gets whether or not the location has a notif
   *
   * @param locationId locationId of location you want to find out if got notif
   */
  public hasLocationNotif(locationId: LocationId) {
    return this.updatedLocations.has(locationId);
  }

  /**
   * Function to check if current location is the given locationId
   *
   * @param locationId locationId that you want to check whether is current one
   */
  public isCurrentLocation(locationId: LocationId) {
    return locationId === GameGlobalAPI.getInstance().getCurrLocId();
  }

  ///////////////////////////////
  //       Location Mode       //
  ///////////////////////////////

  /**
   * Get modes available to a location based on the location ID.
   *
   * @param locationId location ID
   * @returns {GameMode[]} game modes
   */
  public getLocationModes(locationId: LocationId): GameMode[] {
    return Array.from(this.gameMap.getLocationAtId(locationId).modes) || [];
  }

  /**
   * Add a mode to a location. If this is not the current location,
   * then add a notification.
   *
   * @param locationId location ID
   * @param mode game mode to add
   */
  public addLocationMode(locationId: LocationId, mode: GameMode) {
    this.gameMap.getLocationAtId(locationId).modes.add(mode);
    if (!this.isCurrentLocation(locationId)) {
      this.addLocationNotif(locationId);
    }
  }

  /**
   * Remove a mode from a location. If this is not the current location,
   * then add a notification.
   *
   * @param locationId location ID
   * @param mode game mode to remove
   */
  public removeLocationMode(locationId: LocationId, mode: GameMode) {
    this.gameMap.getLocationAtId(locationId).modes.delete(mode);
    if (!this.isCurrentLocation(locationId)) {
      this.addLocationNotif(locationId);
    }
  }

  ///////////////////////////////
  //        State Check        //
  ///////////////////////////////

  /**
   * Get all IDs of a type of game item in a location.
   *
   * @param gameItemType type of game item
   * @param locationId id of location
   * @returns {ItemId[]} items IDS of all game items of that type in the location
   */
  public getGameItemsInLocation(gameItemType: GameItemType, locationId: LocationId): ItemId[] {
    const location = this.gameMap.getLocationAtId(locationId);
    const items = location[gameItemType as keyof typeof location];
    // Non-strict equality check to match both null and undefined
    return items == undefined ? [] : Array.from(items);
  }

  /**
   * Add an item ID of a game item type in gamemap's location.
   *
   * Either render the change instantly, or place a notification inside another location
   *
   * @param gameItemType type of game item
   * @param locationId id of location to add items to
   * @param itemId item ID to be added
   */
  public addItem(gameItemType: GameItemType, locationId: LocationId, itemId: ItemId) {
    const location = this.gameMap.getLocationAtId(locationId);
    const items = location[gameItemType as keyof typeof location];
    (items as Set<any> | undefined)?.add(itemId);

    if (this.isCurrentLocation(locationId)) {
      this.getSubscriberForItemType(gameItemType)?.handleAdd(itemId);
    } else {
      this.addLocationNotif(locationId);
    }
  }

  /**
   * Remove an item ID from game items in gamemap's location.
   * If ID is not found within the game item list, nothing will be executed.
   *
   * Either render the change instantly, or place a notification inside another location
   *
   * @param gameItemType type of game item to remove
   * @param locationId id of location to remove items from
   * @param itemId item ID to be removed
   */
  public removeItem(gameItemType: GameItemType, locationId: LocationId, itemId: string) {
    const location = this.gameMap.getLocationAtId(locationId);
    const items = location[gameItemType as keyof typeof location];
    (items as Set<any> | undefined)?.delete(itemId);

    if (this.isCurrentLocation(locationId)) {
      this.getSubscriberForItemType(gameItemType)?.handleDelete(itemId);
    } else {
      this.addLocationNotif(locationId);
    }
  }

  /**
   * Replace an object property of the given ID with the new object
   * property. Commonly used to update a specific object property.
   *
   * @param id id of object to change
   * @param newObjProp new object property to replace the old one
   */
  public setObjProperty(id: ItemId, newObjProp: ObjectProperty) {
    this.gameMap.setItemInMap(GameItemType.objects, id, newObjProp);

    // Update every location that has the object
    this.gameMap.getLocations().forEach((location, locId) => {
      if (!location.objects.has(id)) return;

      if (this.isCurrentLocation(locId)) {
        this.getSubscriberForItemType(GameItemType.objects)?.handleMutate(id);
      } else {
        this.addLocationNotif(locId);
      }
    });
  }

  /**
   * Replace a bbox property of the given ID with the new bbox
   * property. Commonly used to update a specific bbox property.
   *
   * @param id id of object to change
   * @param newBBoxProp new object property to replace the old one
   */
  public setBBoxProperty(id: ItemId, newBBoxProp: BBoxProperty) {
    this.gameMap.setItemInMap(GameItemType.boundingBoxes, id, newBBoxProp);

    // Update every location that has the bbox
    this.gameMap.getLocations().forEach((location, locId) => {
      if (!location.boundingBoxes.has(id)) return;

      if (this.isCurrentLocation(locId)) {
        this.getSubscriberForItemType(GameItemType.boundingBoxes)?.handleMutate(id);
      } else {
        this.addLocationNotif(locId);
      }
    });
  }

  /**
   * Moves a character to another location and another position
   *
   * @param id id of character to change
   * @param newLocation new location to put this character inside of
   * @param newPosition new position of the character
   */
  public moveCharacter(id: ItemId, newLocation: LocationId, newPosition: GamePosition) {
    // Move position
    this.getCharacterAtId(id).defaultPosition = newPosition;

    // Find location with character and remove him
    this.gameMap.getLocations().forEach((location, locId) => {
      if (!location.characters.has(id)) return;
      this.removeItem(GameItemType.characters, locId, id);
    });

    // Add updated character to new location
    this.addItem(GameItemType.characters, newLocation, id);
  }

  /**
   * Changes the default expression of a character
   *
   * @param id id of character to change
   * @param newExpression new expression of the character
   */
  public updateCharacter(id: ItemId, newExpression: string) {
    this.getCharacterAtId(id).defaultExpression = newExpression;

    // Update every location that has the character
    this.gameMap.getLocations().forEach((location, locId) => {
      if (!location.characters.has(id)) return;

      if (this.isCurrentLocation(locId)) {
        this.getSubscriberForItemType(GameItemType.characters)?.handleMutate(id);
      } else {
        this.addLocationNotif(locId);
      }
    });
  }

  ///////////////////////////////
  //    Chapter Objectives     //
  ///////////////////////////////

  /**
   * Checks whether all the checkpoint objectives has been completed.
   * @returns {boolean}
   */
  public areAllObjectivesComplete(): boolean {
    return this.checkpointObjective.isAllComplete();
  }

  /**
   * Checks whether a specific objective has been completed.
   * If the objective does not exist, this method still returns true.
   *
   * @param key objective name
   * @returns {boolean}
   */
  public isObjectiveComplete(key: string): boolean {
    return this.checkpointObjective.getObjectiveState(key);
  }

  /**
   * Check whether the objectives are complete or not.
   * All specified objectives must be complete for this method
   * to return true.
   *
   * @param keys objective names
   * @returns {boolean}
   */
  public areObjectivesComplete(keys: string[]): boolean {
    let result = true;
    keys.forEach(key => (result = result && this.isObjectiveComplete(key)));
    return result;
  }

  /**
   * Record that an objective has been completed.
   *
   * @param key objective name
   */
  public completeObjective(key: string): void {
    this.checkpointObjective.setObjective(key, true);
  }

  ///////////////////////////////
  //    Chapter Tasks          //
  ///////////////////////////////

  /**
   * Checks whether a specific task has been completed.
   * If the task does not exist, this method still returns true.
   *
   * @param key task id
   * @returns {boolean}
   */
  public isTaskComplete(key: string): boolean {
    return this.checkpointTask.getTaskState(key);
  }

  /**
   * Check whether the tasks are complete or not.
   * All specified tasks must be complete for this method
   * to return true.
   *
   * @param keys task ids
   * @returns {boolean}
   */
  public areTasksComplete(keys: string[]): boolean {
    let result = true;
    keys.forEach(key => (result = result && this.isTaskComplete(key)));
    return result;
  }

  /**
   * Record that a task has been completed.
   *
   * @param key task id
   */
  public completeTask(key: string): void {
    this.checkpointTask.setTask(key, true);
  }

  /**
   * Indicate that a task should be shown to the user.
   *
   * @param key task id
   */
  public showTask(key: string): void {
    this.checkpointTask.showTask(key);
  }

  public getAllVisibleTaskData(): Array<[TaskDetail, boolean]> {
    return this.checkpointTask.getAllVisibleTaskData();
  }

  ///////////////////////////////
  //          Quiz             //
  ///////////////////////////////

  /**
   * Checks whether a quiz has been obtained full marks.
   *
   * @param key quiz id
   * @returns {boolean}
   */
  public isQuizComplete(quizId: string): boolean {
    return this.quizScores.get(quizId) === GameGlobalAPI.getInstance().getQuizLength(quizId);
  }

  /**
   * Checks whether a specific quiz has been played.
   *
   * @param key quiz id
   * @returns {boolean}
   */
  public isQuizAttempted(quizId: string): boolean {
    return this.quizScores.has(quizId);
  }

  /**
   * Get the score of a quiz.
   * Return 0 if the quiz has not been played.
   *
   * @param quizId
   * @returns
   */
  public getQuizScore(quizId: ItemId): number {
    const score = this.quizScores.get(quizId);
    return score ?? 0;
  }

  /**
   * Set the score of a quiz to a given number.
   *
   * @param quizId The id of the quiz.
   * @param newScore The new score to be set.
   */
  public setQuizScore(quizId: string, newScore: number) {
    this.quizScores.set(quizId, newScore);
  }

  ///////////////////////////////
  //          Saving           //
  ///////////////////////////////

  /**
   * Gets array of all objectives that have been completed.
   *
   * @returns {ItemId[]}
   */
  public getCompletedObjectives(): ItemId[] {
    return convertMapToArray(this.checkpointObjective.getObjectives());
  }

  /**
   * Gets array of all tasks that have been completed.
   *
   * @returns {ItemId[]}
   */
  public getCompletedTasks(): ItemId[] {
    return convertMapToArray(this.checkpointTask.getAllTasks());
  }

  /**
   * Gets array of all tasks that have been displayed but yet to be completed.
   *
   * @returns {ItemId[]}
   */
  public getIncompleteTasks(): ItemId[] {
    return this.checkpointTask.getAllIncompleteTasks();
  }

  /**
   * Return an array interactions that have been triggered
   *
   * @returns {string[]}
   */
  public getTriggeredInteractions(): string[] {
    return convertMapToArray(this.triggeredInteractions);
  }

  /**
   * Return an array interactions of state-change actions that have been triggered
   * State-change actions refer to actions that modify the game map's original state
   *
   * @returns {string[]}
   */
  public getTriggeredStateChangeActions(): string[] {
    return this.triggeredStateChangeActions;
  }

  /**
   * Return an array containing [string, number] pairs
   * representing quizzes and the corresponding scores.
   *
   * @returns {[string, number][]}
   */
  public getQuizScores(): [string, number][] {
    return [...this.quizScores];
  }

  public getGameMap = () => this.gameMap;
  public getCharacterAtId = (id: ItemId) => mandatory(this.gameMap.getCharacterMap().get(id));

  private getSaveManager = () => SourceAcademyGame.getInstance().getSaveManager();
  public getChapterNewlyCompleted = () => this.chapterNewlyCompleted;
}

export default GameStateManager;
