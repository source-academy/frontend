import { BBoxProperty } from '../boundingBoxes/GameBoundingBoxTypes';
import { ItemId } from '../commons/CommonTypes';
import GameMap from '../location/GameMap';
import { GameLocationAttr, LocationId } from '../location/GameMapTypes';
import { GameMode } from '../mode/GameModeTypes';
import GameObjective from '../objective/GameObjective';
import { ObjectProperty } from '../objects/GameObjectTypes';
import { convertMapToArray } from '../save/GameSaveHelper';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import GameManager from '../scenes/gameManager/GameManager';
import SourceAcademyGame from '../SourceAcademyGame';
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
  private gameMap: GameMap;
  private checkpointObjective: GameObjective;

  // Triggered Interactions
  private locationHasUpdate: Map<string, Map<GameLocationAttr, boolean>>;
  private triggeredInteractions: Map<ItemId, boolean>;
  private triggeredActions: ItemId[];

  constructor() {
    this.subscribers = new Array<StateObserver>();
    this.gameMap = new GameMap();
    this.checkpointObjective = new GameObjective();
    this.locationHasUpdate = new Map<string, Map<GameLocationAttr, boolean>>();
    this.triggeredInteractions = new Map<ItemId, boolean>();
    this.triggeredActions = [];
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

  ///////////////////////////////
  //        Preprocess         //
  ///////////////////////////////

  public initialise(gameManager: GameManager): void {
    this.gameMap = gameManager.getCurrentCheckpoint().map;
    this.checkpointObjective = gameManager.getCurrentCheckpoint().objectives;

    this.loadStatesFromSaveManager();

    // Register every attribute of each location under the chapter
    this.gameMap.getLocations().forEach((_location, locationId) => {
      this.locationHasUpdate.set(locationId, new Map<GameLocationAttr, boolean>());
      Object.values(GameLocationAttr).forEach(value =>
        this.locationHasUpdate.get(locationId)!.set(value, false)
      );
    });
  }

  /**
   * Loads some game states from the save manager
   */
  public loadStatesFromSaveManager() {
    this.triggeredActions = SourceAcademyGame.getInstance().getSaveManager().getTriggeredActions();

    SourceAcademyGame.getInstance()
      .getSaveManager()
      .getTriggeredInteractions()
      .forEach(interactionId => this.triggerInteraction(interactionId));

    SourceAcademyGame.getInstance()
      .getSaveManager()
      .getCompletedObjectives()
      .forEach(objective => this.checkpointObjective.setObjective(objective, true));
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
    this.gameMap.checkLocationExists(locationId);
    if (attr) {
      return this.locationHasUpdate.get(locationId)!.get(attr);
    }

    // If no attr is specified, update to any attr will return true
    let result = false;
    const locationModeState = this.locationHasUpdate.get(locationId);
    locationModeState!.forEach((hasUpdate, attr, map) => (result = result || hasUpdate));
    return result;
  }

  /**
   * Inform state manager that an attribute's update has been noted of.
   *
   * @param locationId location ID
   * @param attr attribute which update has been consumed
   */
  public consumedLocationUpdate(locationId: LocationId, attr: GameLocationAttr) {
    this.gameMap.checkLocationExists(locationId);
    this.locationHasUpdate.get(locationId)!.set(attr, false);
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
    return Array.from(this.gameMap.getLocationAtId(locationId).modes) || [];
  }

  /**
   * Add a mode to a location.
   *
   * @param locationId location ID
   * @param mode game mode to add
   */
  public addLocationMode(locationId: LocationId, mode: GameMode) {
    const location = this.gameMap.getLocationAtId(locationId);
    location.modes!.add(mode);
    this.gameMap.getLocations().get(locationId)!.modes!.add(mode);
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
    const location = this.gameMap.getLocationAtId(locationId);
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
    const location = this.gameMap.getLocationAtId(locationId);
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
    const location = this.gameMap.getLocationAtId(locationId);
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
    const location = this.gameMap.getLocationAtId(locationId);
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
    return this.gameMap.getObjects();
  }

  /**
   * Replace an object property of the given ID with the new object
   * property. Commonly used to update a specific object property.
   *
   * @param id id of object to change
   * @param newObjProp new object property to replace the old one
   */
  public setObjProperty(id: ItemId, newObjProp: ObjectProperty) {
    this.gameMap.addItemToMap(GameLocationAttr.objects, id, newObjProp);

    // Update every location that uses it
    this.gameMap.getLocations().forEach((location, locationId) => {
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
    return this.gameMap.getBBoxes();
  }

  /**
   * Replace a bbox property of the given ID with the new bbox
   * property. Commonly used to update a specific bbox property.
   *
   * @param id id of object to change
   * @param newBBoxProp new object property to replace the old one
   */
  public setBBoxProperty(id: ItemId, newBBoxProp: BBoxProperty) {
    this.gameMap.addItemToMap(GameLocationAttr.boundingBoxes, id, newBBoxProp);

    // Update every location that uses it
    this.gameMap.getLocations().forEach((location, locationId) => {
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
}

export default GameStateManager;
