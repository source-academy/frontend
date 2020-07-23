import { BBoxProperty } from '../boundingBoxes/GameBoundingBoxTypes';
import { GameCheckpoint } from '../chapter/GameChapterTypes';
import { Character } from '../character/GameCharacterTypes';
import { ItemId } from '../commons/CommonTypes';
import GameMap from '../location/GameMap';
import { GameItemType, LocationId } from '../location/GameMapTypes';
import { GameMode } from '../mode/GameModeTypes';
import GameObjective from '../objective/GameObjective';
import { ObjectProperty } from '../objects/GameObjectTypes';
import { convertMapToArray } from '../save/GameSaveHelper';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import SourceAcademyGame from '../SourceAcademyGame';
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

  // Triggered Interactions
  private updatedLocations: Set<LocationId>;
  private triggeredInteractions: Map<ItemId, boolean>;
  private triggeredActions: ItemId[];

  constructor(gameCheckpoint: GameCheckpoint) {
    this.subscribers = new Map<GameItemType, StateObserver>();

    this.gameMap = gameCheckpoint.map;
    this.checkpointObjective = gameCheckpoint.objectives;

    this.updatedLocations = new Set(this.gameMap.getLocationIds());
    this.triggeredInteractions = new Map<ItemId, boolean>();
    this.triggeredActions = [];

    this.loadStatesFromSaveManager();
  }

  /**
   * Loads some game states from the save manager
   */
  private loadStatesFromSaveManager() {
    this.triggeredActions = this.getSaveManager().getTriggeredActions();

    this.getSaveManager()
      .getTriggeredInteractions()
      .forEach(interactionId => this.triggerInteraction(interactionId));

    this.getSaveManager()
      .getCompletedObjectives()
      .forEach(objective => this.checkpointObjective.setObjective(objective, true));
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
    return mandatory(this.subscribers.get(gameItemType));
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
   * Record that an action has been triggered.
   *
   * @param actionId actionId of interaction
   */
  public triggerAction(actionId: ItemId): void {
    this.triggeredActions.push(actionId);
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
   * Add a mode to a location.
   *
   * @param locationId location ID
   * @param mode game mode to add
   */
  public addLocationMode(locationId: LocationId, mode: GameMode) {
    this.gameMap.getLocationAtId(locationId).modes.add(mode);
  }

  /**
   * Remove a mode from a location.
   *
   * @param locationId location ID
   * @param mode game mode to remove
   */
  public removeLocationMode(locationId: LocationId, mode: GameMode) {
    this.gameMap.getLocationAtId(locationId).modes.delete(mode);
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
    return Array.from(this.gameMap.getLocationAtId(locationId)[gameItemType]) || [];
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
    this.gameMap.getLocationAtId(locationId)[gameItemType].add(itemId);

    this.isCurrentLocation(locationId)
      ? this.getSubscriberForItemType(gameItemType).handleAdd(itemId)
      : this.addLocationNotif(locationId);
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
    this.gameMap.getLocationAtId(locationId)[gameItemType].delete(itemId);

    this.isCurrentLocation(locationId)
      ? this.getSubscriberForItemType(gameItemType).handleDelete(itemId)
      : this.addLocationNotif(locationId);
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
    this.getSubscriberForItemType(GameItemType.objects).handleMutate(id);
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
    this.getSubscriberForItemType(GameItemType.boundingBoxes).handleMutate(id);
  }

  /**
   * Replace a character of the given ID with the new character
   * property. Commonly used to update a specific character property.
   *
   * @param id id of object to change
   * @param newCharacter new object property to replace the old one
   */
  public setCharacterProperty(id: ItemId, newCharacter: Character) {
    this.gameMap.setItemInMap(GameItemType.boundingBoxes, id, newCharacter);
    this.getSubscriberForItemType(GameItemType.characters).handleMutate(id);
  }

  ///////////////////////////////
  //    Chapter Objectives     //
  ///////////////////////////////

  /**
   * Checks whether all the checkpoint objectives has been completed.
   * @returns {boolean}
   */
  public isAllComplete(): boolean {
    return this.checkpointObjective.isAllComplete();
  }

  /**
   * Checks whether a specific objective has been completed.
   * If the objective does not exist, this method still return true.
   *
   * @param key objective name
   * @returns {boolean}
   */
  public isObjectiveComplete(key: string): boolean {
    const isComplete = this.checkpointObjective.getObjectiveState(key);
    if (isComplete === undefined || isComplete) {
      return true;
    }
    return false;
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
   * Return an array interactions that have been triggered
   *
   * @returns {string[]}
   */
  public getTriggeredInteractions(): string[] {
    return convertMapToArray(this.triggeredInteractions);
  }

  /**
   * Return an array interactions of actions that have been triggered
   *
   * @returns {string[]}
   */
  public getTriggeredActions(): string[] {
    return this.triggeredActions;
  }

  public getGameMap = () => this.gameMap;
  private getSaveManager = () => SourceAcademyGame.getInstance().getSaveManager();
}

export default GameStateManager;
