import { BBoxProperty } from '../boundingBoxes/GameBoundingBoxTypes';
import { GameCheckpoint } from '../chapter/GameChapterTypes';
import { ItemId } from '../commons/CommonTypes';
import { GameLocation, GameLocationAttr, LocationId } from '../location/GameMapTypes';
import { GameMode } from '../mode/GameModeTypes';
import GameObjective from '../objective/GameObjective';
import { ObjectProperty } from '../objects/GameObjectTypes';
import { jsObjectToMap, jsonToLocationStates } from '../save/GameSaveHelper';
import { GameSaveState } from '../save/GameSaveTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import GameManager from '../scenes/gameManager/GameManager';
import { mandatory } from '../utils/GameUtils';
import { StateChangeType, StateObserver, StateSubject } from './GameStateTypes';

/**
 * Manages all states related to story, chapter, or checkpoint;
 * e.g. checkpoint objectives, objects' property, bboxes' property.
 *
 * Other than this manager, all other manager should not need to
 * manage their own state.
 *
 * Employs observer pattern, and notifies its subjects on state update.
 */
class GameStateManager implements StateSubject {
  // Subscribers
  public subscribers: Array<StateObserver>;

  // Game State
  private checkpoint: GameCheckpoint;
  private checkpointObjective: GameObjective;
  private locationHasUpdate: Map<string, Map<GameLocationAttr, boolean>>;
  private locationStates: Map<string, GameLocation>;
  private objectPropertyMap: Map<ItemId, ObjectProperty>;
  private bboxPropertyMap: Map<ItemId, BBoxProperty>;

  // Triggered Interactions
  private triggeredInteractions: Map<ItemId, boolean>;

  constructor() {
    this.subscribers = new Array<StateObserver>();

    this.checkpoint = {} as GameCheckpoint;
    this.checkpointObjective = new GameObjective();
    this.locationHasUpdate = new Map<string, Map<GameLocationAttr, boolean>>();
    this.locationStates = new Map<string, GameLocation>();
    this.objectPropertyMap = new Map<ItemId, ObjectProperty>();
    this.bboxPropertyMap = new Map<ItemId, BBoxProperty>();

    this.triggeredInteractions = new Map<ItemId, boolean>();
  }

  ///////////////////////////////
  //        Subscribers        //
  ///////////////////////////////

  /**
   * Update all subscribers that there is an update at the location ID.
   *
   * @param changeType type of change
   * @param locationId ID of location that has an update.
   * @param id id of item related to the update
   */
  public update(changeType: StateChangeType, locationId: LocationId, id?: string) {
    this.subscribers.forEach(observer => observer.notify(changeType, locationId, id));
  }

  /**
   * Allow a StateObserver implementer to subscribe to change of states.
   *
   * @param observer the instance of the implementer
   */
  public subscribe(observer: StateObserver) {
    this.subscribers.push(observer);
  }

  /**
   * Allow a StateObserver implementer to unsubscribe to change of states.
   *
   * @param observer the instance of the implementer
   */
  public unsubscribe(observer: StateObserver) {
    this.subscribers = this.subscribers.filter(obs => obs.observerId !== observer.observerId);
  }

  ///////////////////////////////
  //          Helpers          //
  ///////////////////////////////

  /**
   * Update a location ID's state based on its GameMode.
   * Also notifies subjects.
   *
   * @param targetLocId the id of to be upDated location
   * @param mode mode that has been updated
   */
  private updateLocationStateMode(
    changeType: StateChangeType,
    targetLocId: LocationId,
    mode: GameMode
  ): void {
    switch (mode) {
      case GameMode.Explore:
        this.updateLocationStateAttr(changeType, targetLocId, GameLocationAttr.boundingBoxes);
        this.updateLocationStateAttr(changeType, targetLocId, GameLocationAttr.objects);
        return;
      case GameMode.Move:
        this.updateLocationStateAttr(changeType, targetLocId, GameLocationAttr.navigation);
        return;
      case GameMode.Talk:
        this.updateLocationStateAttr(changeType, targetLocId, GameLocationAttr.talkTopics);
        return;
      default:
        return;
    }
  }

  /**
   * Update a location ID's state based on its attribute.
   * Also notifies subjects.
   *
   * @param changeType type of change
   * @param targetLocId the id of to be upDated location
   * @param attr attribute that has been updated
   * @param attrId id of the attribute element being added
   */
  private updateLocationStateAttr(
    changeType: StateChangeType,
    targetLocId: LocationId,
    attr: GameLocationAttr,
    attrId?: string
  ): void {
    const currLocId = GameGlobalAPI.getInstance().getCurrLocId();

    this.locationHasUpdate.get(targetLocId)!.set(attr, true);

    // Only update if player is not already at the location
    if (currLocId !== targetLocId) {
      // Location has an update to its state, reset its interaction back to not triggered
      this.triggeredInteractions.set(targetLocId, false);
    }

    // Notify subscribers
    this.update(changeType, targetLocId, attrId);
  }

  /**
   * Check whether an location ID exist.
   * Throw error if it does not exist.
   *
   * @param locIds id to check
   */
  private checkLocationsExist(locIds: string[]): void {
    locIds.forEach(locId => mandatory(this.locationStates.get(locId)));
  }

  /**
   * Return a location based on its ID.
   * @param locId id of the location
   * @returns {GameLocation}
   */
  private getLocationById = (locId: LocationId) => mandatory(this.locationStates.get(locId));

  ///////////////////////////////
  //        Preprocess         //
  ///////////////////////////////

  public initialise(gameManager: GameManager): void {
    this.checkpoint = gameManager.getCurrentCheckpoint();
    const gameSaveState = gameManager.getSaveManager().getLoadedGameStoryState();
    this.checkpointObjective = this.checkpoint.objectives;

    if (gameSaveState) {
      this.loadFromGameStoryState(gameSaveState);
    } else {
      this.loadNewGameStoryState();
    }

    // Register every attribute of each location under the chapter
    this.locationStates.forEach((location, locationId) => {
      this.locationHasUpdate.set(locationId, new Map<GameLocationAttr, boolean>());
      Object.values(GameLocationAttr).forEach(value =>
        this.locationHasUpdate.get(locationId)!.set(value, true)
      );
    });
  }

  /**
   * Load GameSaveState and use it as the values of GameStateManager's attributes.
   *
   * @param gameSaveState state to load
   */
  private loadFromGameStoryState(gameSaveState: GameSaveState) {
    this.checkpointObjective.setObjectives(jsObjectToMap(gameSaveState.chapterObjective));
    this.locationStates = jsonToLocationStates(gameSaveState.locationStates);
    this.objectPropertyMap = jsObjectToMap(gameSaveState.objectPropertyMap);
    this.bboxPropertyMap = jsObjectToMap(gameSaveState.bboxPropertyMap);
    this.triggeredInteractions = jsObjectToMap(gameSaveState.triggeredInteractions);
  }

  /**
   * Initialise GameStateManager's attributes with fresh states.
   */
  private loadNewGameStoryState() {
    this.checkpointObjective = this.checkpoint.objectives;
    this.locationStates = this.checkpoint.map.getLocations();
    this.objectPropertyMap = this.checkpoint.map.getObjects();
    this.bboxPropertyMap = this.checkpoint.map.getBBoxes();
    this.triggeredInteractions.clear();
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
   * Checks whether an interaction ID has been triggered or not.
   *
   * @param id id of interaction
   * @returns {boolean}
   */
  public hasTriggeredInteraction(id: string): boolean | undefined {
    return this.triggeredInteractions.get(id);
  }

  ///////////////////////////////
  //       State Check         //
  ///////////////////////////////

  /**
   * Checks whether a location has any update based on the modes.
   * A location has an update if any of its mode has been updated since
   * last user interaction.
   *
   * If the mode parameter is specified, only that specific mode is checked.
   * If the mode parameter is not specified, update to any mode will return true.
   *
   * @param locationId location ID
   * @param mode mode to check
   * @returns {boolean}
   */
  public hasLocationUpdateMode(locationId: LocationId, mode?: GameMode): boolean | undefined {
    if (mode) {
      switch (mode) {
        case GameMode.Explore:
          this.hasLocationUpdateAttr(locationId, GameLocationAttr.boundingBoxes);
          this.hasLocationUpdateAttr(locationId, GameLocationAttr.objects);
          return;
        case GameMode.Move:
          this.hasLocationUpdateAttr(locationId, GameLocationAttr.navigation);
          return;
        case GameMode.Talk:
          this.hasLocationUpdateAttr(locationId, GameLocationAttr.talkTopics);
          return;
        default:
          return;
      }
    }
    return this.hasLocationUpdateAttr(locationId);
  }

  /**
   * Checks whether a location has any update based on the attributes.
   * A location has an update if any of its attributes has been updated since
   * last user interaction.
   *
   * If the mode parameter is specified, only that specific mode is checked.
   * If the mode parameter is not specified, update to any mode will return true.
   *
   * @param locationId location ID
   * @param mode mode to check
   * @returns {boolean}
   */
  public hasLocationUpdateAttr(
    locationId: LocationId,
    attr?: GameLocationAttr
  ): boolean | undefined {
    this.checkLocationsExist([locationId]);
    if (attr) {
      return this.locationHasUpdate.get(locationId)!.get(attr);
    }

    // If no attr is specified, update to any attr will return true
    let result = false;
    const locationModeState = this.locationHasUpdate.get(locationId);
    locationModeState!.forEach((hasUpdate, attr, map) => (result = result || hasUpdate));
    return result;
  }

  ///////////////////////////////
  //    Location Mode State    //
  ///////////////////////////////

  /**
   * Get modes available to a location based on the location ID.
   *
   * @param locationId location ID
   * @returns {GameMode[]} game modes
   */
  public getLocationMode(locationId: LocationId): GameMode[] {
    return Array.from(this.checkpoint.map.getLocationAtId(locationId).modes) || [];
  }

  /**
   * Add a mode to a location.
   *
   * @param locationId location ID
   * @param mode game mode to add
   */
  public addLocationMode(locationId: LocationId, mode: GameMode) {
    const location = this.getLocationById(locationId);
    location.modes!.add(mode);
    this.locationStates.get(locationId)!.modes!.add(mode);
    this.updateLocationStateMode(StateChangeType.Add, locationId, GameMode.Menu);
  }

  /**
   * Remove a mode from a location.
   * If the mode is not present at the location, nothing
   * will be executed.
   *
   * @param locationId location ID
   * @param mode game mode to remove
   */
  public removeLocationMode(locationId: LocationId, mode: GameMode) {
    const location = this.getLocationById(locationId);
    if (!location.modes) return;
    location.modes.delete(mode);
    this.updateLocationStateMode(StateChangeType.Delete, locationId, GameMode.Menu);
  }

  ///////////////////////////////
  //    Location Attr State    //
  ///////////////////////////////

  /**
   * Get an IDs of an attribute of a location.
   *
   * @param attr location attribute
   * @param locationId id of location
   * @param {ItemId[]}
   */
  public getLocationAttr(attr: GameLocationAttr, locationId: LocationId): ItemId[] {
    const location = this.getLocationById(locationId);
    return Array.from(location[attr]) || [];
  }

  /**
   * Add an item ID to an attribute of the location.
   *
   * @param attr attribute to add to
   * @param locationId id of location
   * @param attrElem item ID to be added
   */
  public addLocationAttr(attr: GameLocationAttr, locationId: LocationId, attrElem: string) {
    const location = this.getLocationById(locationId);
    if (!location[attr]) location[attr] = new Set([]);
    location[attr].add(attrElem);
    this.updateLocationStateAttr(StateChangeType.Add, locationId, attr, attrElem);
  }

  /**
   * Remove an item ID from an attribute of the location.
   * If ID is not found within the attribute, nothing will be executed.
   *
   * @param attr attribute to remove from
   * @param locationId id of location
   * @param attrElem item ID to be removed
   */
  public removeLocationAttr(attr: GameLocationAttr, locationId: LocationId, attrElem: string) {
    const location = this.getLocationById(locationId);
    if (!location[attr]) return;
    location[attr] = location[attr].filter((oldAttr: string) => oldAttr !== attrElem);
    this.updateLocationStateAttr(StateChangeType.Delete, locationId, attr, attrElem);
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
  //       Obj Property        //
  ///////////////////////////////

  /**
   * Get object property map.
   *
   * @returns {Map<ItemId, ObjectProperty>}
   */
  public getObjPropertyMap() {
    return this.objectPropertyMap;
  }

  /**
   * Replace an object property of the given ID with the new object
   * property. Commonly used to update a specific object property.
   *
   * @param id id of object to change
   * @param newObjProp new object property to replace the old one
   */
  public setObjProperty(id: ItemId, newObjProp: ObjectProperty) {
    this.objectPropertyMap.set(id, newObjProp);

    // Update every location that uses it
    this.locationStates.forEach((location, locationId) => {
      if (location.objects && location.objects.has(id)) {
        this.updateLocationStateAttr(
          StateChangeType.Mutate,
          locationId,
          GameLocationAttr.objects,
          id
        );
      }
    });
  }

  ///////////////////////////////
  //       BBox Property       //
  ///////////////////////////////

  /**
   * Get bbox property map.
   *
   * @returns {Map<ItemId, BBoxProperty>}
   */
  public getBBoxPropertyMap() {
    return this.bboxPropertyMap;
  }

  /**
   * Replace a bbox property of the given ID with the new bbox
   * property. Commonly used to update a specific bbox property.
   *
   * @param id id of object to change
   * @param newBBoxProp new object property to replace the old one
   */
  public setBBoxProperty(id: ItemId, newBBoxProp: BBoxProperty) {
    this.bboxPropertyMap.set(id, newBBoxProp);

    // Update every location that uses it
    this.locationStates.forEach((location, locationId) => {
      if (location.boundingBoxes && location.boundingBoxes.delete(id)) {
        this.updateLocationStateAttr(
          StateChangeType.Mutate,
          locationId,
          GameLocationAttr.boundingBoxes,
          id
        );
      }
    });
  }

  ///////////////////////////////
  //          Saving           //
  ///////////////////////////////

  /**
   * Return a map of game locations; with its location ID as key.
   *
   * @returns {Map<LocationId, GameLocation>}
   */
  public getLocationStates() {
    return this.locationStates;
  }

  /**
   * Get the current checkpoint objectives.
   *
   * @returns {GameObjective}
   */
  public getCheckpointObjectives() {
    return this.checkpointObjective;
  }

  /**
   * Return a map of interactions and whether they has been triggered
   * or not.
   *
   * @returns {Map<string, boolean>}
   */
  public getTriggeredInteractions() {
    return this.triggeredInteractions;
  }
}

export default GameStateManager;
