import { GameChapter } from '../chapter/GameChapterTypes';
import { GameLocation, GameLocationAttr } from '../location/GameMapTypes';
import { GameMode } from '../mode/GameModeTypes';

class GameStateManager {
  private chapter: GameChapter;
  private locationHasUpdate: Map<string, boolean>;
  private locationStates: Map<string, GameLocation>;

  constructor() {
    this.locationHasUpdate = new Map<string, boolean>();
    this.locationStates = new Map<string, GameLocation>();
    this.chapter = {} as GameChapter;
  }

  private updateLocationUpdateState(currLocName: string, targetLocName: string): void {
    if (currLocName !== targetLocName) {
      this.locationHasUpdate.set(targetLocName, true);
    }
  }

  private checkLocationsExist(locationNames: string[]): void {
    locationNames.forEach(locationName => {
      if (!this.locationStates.get(locationName)) {
        throw console.error('Location ', locationName, ' does not exist!');
      }
    });
  }

  public processChapter(chapter: GameChapter): void {
    this.chapter = chapter;
    this.locationStates = this.chapter.map.getLocations();
    this.locationStates.forEach((location, locationName, map) => {
      this.locationHasUpdate.set(locationName, true);
    });
  }

  ///////////////////////////////
  //   Location Visit State    //
  ///////////////////////////////

  public visitedLocation(locationName: string): void {
    this.checkLocationsExist([locationName]);
    // this.locationHasUpdate.set(locationName, false);
  }

  public hasLocationUpdate(locationName: string): boolean | undefined {
    return this.locationHasUpdate.get(locationName);
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
    this.updateLocationUpdateState(currLocName, locationName);
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
    this.updateLocationUpdateState(currLocName, locationName);
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
    this.updateLocationUpdateState(currLocName, locationName);
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
    this.updateLocationUpdateState(currLocName, locationName);
  }
}

export default GameStateManager;
