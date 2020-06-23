import { GameCheckpoint } from '../chapter/GameChapterTypes';
import { GameLocation, GameLocationAttr, LocationId } from '../location/GameMapTypes';
import { GameMode } from '../mode/GameModeTypes';
import GameObjective from '../objective/GameObjective';
import { ItemId } from '../commons/CommonsTypes';
import { ObjectProperty } from '../objects/GameObjectTypes';
import GameActionManager from '../action/GameActionManager';
import { BBoxProperty } from '../boundingBoxes/GameBoundingBoxTypes';
import { jsObjectToMap } from '../save/GameSaveHelper';
import { GameSaveState } from '../save/GameSaveTypes';
import { StateSubject, StateObserver } from './GameStateTypes';

class GameStateManager implements StateSubject {
  // Subscribers
  public subscribers: Array<StateObserver>;

  // Game State
  private checkpoint: GameCheckpoint;
  private checkpointObjective: GameObjective;
  private locationHasUpdate: Map<string, Map<GameMode, boolean>>;
  private locationStates: Map<string, GameLocation>;
  private objectPropertyMap: Map<ItemId, ObjectProperty>;
  private bboxPropertyMap: Map<ItemId, BBoxProperty>;

  // Triggered Interactions
  private triggeredInteractions: Map<ItemId, boolean>;

  constructor() {
    this.subscribers = new Array<StateObserver>();

    this.checkpoint = {} as GameCheckpoint;
    this.checkpointObjective = new GameObjective();
    this.locationHasUpdate = new Map<string, Map<GameMode, boolean>>();
    this.locationStates = new Map<string, GameLocation>();
    this.objectPropertyMap = new Map<ItemId, ObjectProperty>();
    this.bboxPropertyMap = new Map<ItemId, BBoxProperty>();

    this.triggeredInteractions = new Map<ItemId, boolean>();
  }

  ///////////////////////////////
  //        Subscribers        //
  ///////////////////////////////

  public update(locationId: LocationId) {
    this.subscribers.forEach(observer => observer.notify(locationId));
  }

  public subscribe(observer: StateObserver) {
    this.subscribers.push(observer);
  }

  public unsubscribe(observer: StateObserver) {
    this.subscribers = this.subscribers.filter(obs => obs.observerId !== observer.observerId);
  }

  ///////////////////////////////
  //          Helpers          //
  ///////////////////////////////

  private updateLocationStateMode(targetLocId: LocationId, mode: GameMode): void {
    const currLocId = GameActionManager.getInstance().getGameManager().currentLocationId;

    this.locationHasUpdate.get(targetLocId)!.set(mode, true);

    // Location has an update to its state, reset its interaction back to not triggered
    if (currLocId !== targetLocId) {
      this.triggeredInteractions.set(targetLocId, false);
    }

    // Notify subscribers
    this.update(targetLocId);
  }

  private updateLocationStateAttr(targetLocName: string, attr: GameLocationAttr): void {
    switch (attr) {
      case GameLocationAttr.navigation:
        return this.updateLocationStateMode(targetLocName, GameMode.Move);
      case GameLocationAttr.talkTopics:
        return this.updateLocationStateMode(targetLocName, GameMode.Talk);
      case GameLocationAttr.boundingBoxes:
      case GameLocationAttr.objects:
        return this.updateLocationStateMode(targetLocName, GameMode.Explore);
      default:
        return;
    }
  }

  private checkLocationsExist(locationIds: string[]): void {
    locationIds.forEach(locationId => {
      if (!this.locationStates.get(locationId)) {
        throw console.error('Location ', locationId, ' does not exist!');
      }
    });
  }

  ///////////////////////////////
  //        Preprocess         //
  ///////////////////////////////

  public initialise(chapter: GameCheckpoint, gameSaveState: GameSaveState | undefined): void {
    this.checkpoint = chapter;
    this.checkpointObjective = this.checkpoint.objectives;

    if (gameSaveState) {
      this.loadFromGameStoryState(gameSaveState);
    } else {
      this.loadNewGameStoryState();
    }

    // Register every mode of each location under the chapter
    this.locationStates.forEach((location, locationId, map) => {
      this.locationHasUpdate.set(locationId, new Map<GameMode, boolean>());
      if (location.modes) {
        location.modes.forEach(mode => this.locationHasUpdate.get(locationId)!.set(mode, true));
      }
    });
  }

  private loadFromGameStoryState(gameStoryState: GameSaveState) {
    this.checkpointObjective.setObjectives(jsObjectToMap(gameStoryState.chapterObjective));
    this.locationStates = jsObjectToMap(gameStoryState.locationStates);
    this.objectPropertyMap = jsObjectToMap(gameStoryState.objectPropertyMap);
    this.bboxPropertyMap = jsObjectToMap(gameStoryState.bboxPropertyMap);
    this.triggeredInteractions = jsObjectToMap(gameStoryState.triggeredInteractions);
  }

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

  public triggerInteraction(id: string): void {
    this.triggeredInteractions.set(id, true);
  }

  public hasTriggeredInteraction(id: string): boolean | undefined {
    return this.triggeredInteractions.get(id);
  }

  ///////////////////////////////
  //       State Check         //
  ///////////////////////////////

  public hasLocationUpdate(locationId: LocationId, mode?: GameMode): boolean | undefined {
    this.checkLocationsExist([locationId]);
    if (mode) {
      return this.locationHasUpdate.get(locationId)!.get(mode);
    }

    // If no mode is specified, update to any mode will return true
    let result = false;
    const locationModeState = this.locationHasUpdate.get(locationId);
    locationModeState!.forEach((hasUpdate, mode, map) => (result = result || hasUpdate));
    return result;
  }

  ///////////////////////////////
  //    Location Mode State    //
  ///////////////////////////////

  public getLocationMode(locationId: LocationId): GameMode[] {
    return this.checkpoint.map.getLocationAtId(locationId).modes!;
  }

  public addLocationMode(locationId: LocationId, mode: GameMode) {
    this.checkLocationsExist([locationId]);

    this.locationStates.get(locationId)!.modes!.push(mode);
    this.updateLocationStateMode(locationId, GameMode.Menu);
  }

  public removeLocationMode(locationId: LocationId, mode: GameMode) {
    this.checkLocationsExist([locationId]);

    const newAttr = this.locationStates
      .get(locationId)!
      .modes!.filter((oldAttr: string) => oldAttr !== mode);
    this.locationStates.get(locationId)!.modes = newAttr;
    this.updateLocationStateMode(locationId, GameMode.Menu);
  }

  ///////////////////////////////
  //    Location Attr State    //
  ///////////////////////////////

  public getLocationAttr(attr: GameLocationAttr, locationId: LocationId) {
    const location = this.locationStates.get(locationId);
    return location ? location[attr] : undefined;
  }

  public addLocationAttr(attr: GameLocationAttr, locationId: LocationId, attrElem: string) {
    this.checkLocationsExist([locationId]);

    if (!this.locationStates.get(locationId)![attr]) {
      this.locationStates.get(locationId)![attr] = [];
    }
    this.locationStates.get(locationId)![attr]!.push(attrElem);
    this.updateLocationStateAttr(locationId, attr);
  }

  public removeLocationAttr(attr: GameLocationAttr, locationId: LocationId, attrElem: string) {
    this.checkLocationsExist([locationId]);

    if (!this.locationStates.get(locationId)![attr]) {
      return;
    }
    const newAttr = this.locationStates
      .get(locationId)!
      [attr]!.filter((oldAttr: string) => oldAttr !== attrElem);
    this.locationStates.get(locationId)![attr] = newAttr;
    this.updateLocationStateAttr(locationId, attr);
  }

  ///////////////////////////////
  //    Chapter Objectives     //
  ///////////////////////////////

  public isAllComplete(): boolean {
    return this.checkpointObjective.isAllComplete();
  }

  public isObjectiveComplete(key: string): boolean {
    const isComplete = this.checkpointObjective.getObjectiveState(key);
    if (isComplete === undefined || isComplete) {
      return true;
    }
    return false;
  }

  public areObjectivesComplete(keys: string[]): boolean {
    let result = true;
    keys.forEach(key => (result = result && this.isObjectiveComplete(key)));
    return result;
  }

  public completeObjective(key: string): void {
    this.checkpointObjective.setObjective(key, true);
  }

  ///////////////////////////////
  //       Obj Property        //
  ///////////////////////////////

  public getObjPropertyMap() {
    return this.objectPropertyMap;
  }

  public setObjProperty(currLocName: LocationId, id: ItemId, newObjProp: ObjectProperty) {
    this.objectPropertyMap.set(id, newObjProp);

    // Update every location that uses it
    this.locationStates.forEach((location, locationId, map) => {
      if (location.objects && location.objects.find(objId => objId === id)) {
        this.updateLocationStateAttr(locationId, GameLocationAttr.objects);
      }
    });
  }

  ///////////////////////////////
  //       BBox Property       //
  ///////////////////////////////

  public getBBoxPropertyMap() {
    return this.bboxPropertyMap;
  }

  public setBBoxProperty(currLocName: LocationId, id: ItemId, newBBoxProp: BBoxProperty) {
    this.bboxPropertyMap.set(id, newBBoxProp);

    // Update every location that uses it
    this.locationStates.forEach((location, locationId, map) => {
      if (location.boundingBoxes && location.boundingBoxes.find(bboxId => bboxId === id)) {
        this.updateLocationStateAttr(locationId, GameLocationAttr.boundingBoxes);
      }
    });
  }

  ///////////////////////////////
  //          Saving           //
  ///////////////////////////////

  public getLocationStates() {
    return this.locationStates;
  }

  public getCheckpointObjectives() {
    return this.checkpointObjective;
  }

  public getTriggeredInteractions() {
    return this.triggeredInteractions;
  }
}

export default GameStateManager;
