import { GameChapter } from '../chapter/GameChapterTypes';
import { GameLocation, GameLocationAttr } from '../location/GameMapTypes';
import { GameMode } from '../mode/GameModeTypes';
import GameObjective from '../objective/GameObjective';
import { ItemId } from '../commons/CommonsTypes';

class GameStateManager {
  // Game State
  private chapter: GameChapter;
  private chapterObjective: GameObjective;
  private locationHasUpdate: Map<string, Map<GameMode, boolean>>;
  private locationStates: Map<string, GameLocation>;

  // Triggered Interactions
  private triggeredInteractions: Map<ItemId, boolean>;

  constructor() {
    this.chapter = {} as GameChapter;
    this.chapterObjective = new GameObjective();
    this.locationHasUpdate = new Map<string, Map<GameMode, boolean>>();
    this.locationStates = new Map<string, GameLocation>();
    this.triggeredInteractions = new Map<ItemId, boolean>();
  }

  ///////////////////////////////
  //          Helpers          //
  ///////////////////////////////

  private updateLocationStateMode(
    currLocName: string,
    targetLocName: string,
    mode: GameMode
  ): void {
    this.locationHasUpdate.get(targetLocName)!.set(mode, true);

    // Location has an update to its state, reset its interaction back to not triggered
    if (currLocName !== targetLocName) {
      this.triggeredInteractions.set(targetLocName, false);
    }
  }

  private updateLocationStateAttr(
    currLocName: string,
    targetLocName: string,
    attr: GameLocationAttr
  ): void {
    switch (attr) {
      case GameLocationAttr.navigation:
        return this.updateLocationStateMode(currLocName, targetLocName, GameMode.Move);
      case GameLocationAttr.talkTopics:
        return this.updateLocationStateMode(currLocName, targetLocName, GameMode.Talk);
      case GameLocationAttr.boundingBoxes:
      case GameLocationAttr.objects:
        return this.updateLocationStateMode(currLocName, targetLocName, GameMode.Explore);
      default:
        return;
    }
  }

  private checkLocationsExist(locationNames: string[]): void {
    locationNames.forEach(locationName => {
      if (!this.locationStates.get(locationName)) {
        throw console.error('Location ', locationName, ' does not exist!');
      }
    });
  }

  ///////////////////////////////
  //        Preprocess         //
  ///////////////////////////////

  public processChapter(chapter: GameChapter): void {
    this.chapter = chapter;
    this.locationStates = this.chapter.map.getLocations();
    this.chapterObjective = this.chapter.objectives;

    // Register every mode of each location under the chapter
    this.locationStates.forEach((location, locationName, map) => {
      this.locationHasUpdate.set(locationName, new Map<GameMode, boolean>());
      if (location.modes) {
        location.modes.forEach(mode => this.locationHasUpdate.get(locationName)?.set(mode, true));
      }
    });
  }

  ///////////////////////////////
  //       Update State        //
  ///////////////////////////////

  public triggerInteraction(id: string): void {
    this.triggeredInteractions.set(id, true);
  }

  ///////////////////////////////
  //       State Check         //
  ///////////////////////////////

  public hasLocationUpdate(locationName: string, mode?: GameMode): boolean | undefined {
    this.checkLocationsExist([locationName]);
    if (mode) {
      return this.locationHasUpdate.get(locationName)!.get(mode);
    }

    let result = false;
    const locationModeState = this.locationHasUpdate.get(locationName);
    locationModeState!.forEach((hasUpdate, mode, map) => (result = result || hasUpdate));
    return result;
  }

  public hasTriggeredInteraction(id: string): boolean | undefined {
    return this.triggeredInteractions.get(id);
  }

  ///////////////////////////////
  //    Location Mode State    //
  ///////////////////////////////

  public getLocationMode(locationName: string) {
    const location = this.locationStates.get(locationName);
    return location ? location.modes : undefined;
  }

  public addLocationMode(currLocName: string, locationName: string, mode: GameMode) {
    this.checkLocationsExist([currLocName, locationName]);

    if (this.locationStates.get(locationName)!.modes) {
      this.locationStates.get(locationName)!.modes = [];
    }
    this.locationStates.get(locationName)!.modes!.push(mode);
    this.updateLocationStateMode(currLocName, locationName, GameMode.Menu);
  }

  public removeLocationMode(currLocName: string, locationName: string, mode: GameMode) {
    this.checkLocationsExist([currLocName, locationName]);

    if (this.locationStates.get(locationName)!.modes) {
      return;
    }
    const newAttr = this.locationStates
      .get(locationName)!
      .modes!.filter((oldAttr: string) => oldAttr !== mode);
    this.locationStates.get(locationName)!.modes = newAttr;
    this.updateLocationStateMode(currLocName, locationName, GameMode.Menu);
  }

  ///////////////////////////////
  //    Location Attr State    //
  ///////////////////////////////

  public getLocationAttr(attr: GameLocationAttr, locationName: string) {
    const location = this.locationStates.get(locationName);
    return location ? location[attr] : undefined;
  }

  public addLocationAttr(
    attr: GameLocationAttr,
    currLocName: string,
    locationName: string,
    attrElem: string
  ) {
    this.checkLocationsExist([currLocName, locationName]);

    if (this.locationStates.get(locationName)![attr]) {
      this.locationStates.get(locationName)![attr] = [];
    }
    this.locationStates.get(locationName)![attr]!.push(attrElem);
    this.updateLocationStateAttr(currLocName, locationName, attr);
  }

  public removeLocationAttr(
    attr: GameLocationAttr,
    currLocName: string,
    locationName: string,
    attrElem: string
  ) {
    this.checkLocationsExist([currLocName, locationName]);

    if (this.locationStates.get(locationName)![attr]) {
      return;
    }
    const newAttr = this.locationStates
      .get(locationName)!
      [attr]!.filter((oldAttr: string) => oldAttr !== attrElem);
    this.locationStates.get(locationName)![attr] = newAttr;
    this.updateLocationStateAttr(currLocName, locationName, attr);
  }

  ///////////////////////////////
  //    Chapter Objectives     //
  ///////////////////////////////

  public isAllComplete(): boolean {
    return this.chapterObjective.isAllComplete();
  }

  public isObjectiveComplete(key: string): boolean {
    const isComplete = this.chapterObjective.getObjectiveState(key);
    return isComplete || true;
  }

  public areObjectivesComplete(keys: string[]): boolean {
    let result = true;
    keys.forEach(key => (result = result && this.isObjectiveComplete(key)));
    return result;
  }

  public completeObjective(key: string): void {
    return this.chapterObjective.setObjective(key, true);
  }
}

export default GameStateManager;
