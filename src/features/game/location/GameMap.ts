import { GameLocation } from '../location/GameMapTypes';
import { GameImage, DialogueId, ObjectId, BBoxId } from '../commons/CommonsTypes';
import { Dialogue } from '../dialogue/DialogueTypes';
import { ObjectProperty } from '../objects/ObjectsTypes';
import { BBoxProperty } from '../boundingBoxes/BoundingBoxTypes';

class GameMap {
  private locationAssets: Map<string, GameImage>;
  private navigation: Map<string, string[]>;
  private locations: Map<string, GameLocation>;
  private talkTopics: Map<DialogueId, Dialogue>;

  constructor() {
    this.locationAssets = new Map<string, GameImage>();
    this.navigation = new Map<string, string[]>();
    this.locations = new Map<string, GameLocation>();
    this.talkTopics = new Map<DialogueId, Dialogue>();
  }

  public addLocationAsset(asset: GameImage) {
    this.locationAssets.set(asset.key, asset);
  }

  public getLocationAsset(location: GameLocation): GameImage | undefined {
    return this.locationAssets.get(location.assetKey);
  }

  public getLocationAssets(): Map<string, GameImage> {
    return this.locationAssets;
  }

  public setNavigationFrom(id: string, destination: string[]) {
    this.navigation.set(id, destination);
  }

  public getNavigationFrom(id: string): string[] | undefined {
    return this.navigation.get(id);
  }

  public setLocation(location: GameLocation): void {
    this.locations.set(location.name, location);
  }

  public getLocation(id: string): GameLocation | undefined {
    return this.locations.get(id);
  }

  public getLocations(): Map<string, GameLocation> {
    return this.locations;
  }

  public setTalkTopicAt(locationId: string, dialogueId: DialogueId, dialogueObject: Dialogue) {
    this.talkTopics.set(dialogueId, dialogueObject);

    const location = this.locations.get(locationId);
    if (!location) return;

    if (!location.talkTopics) {
      location.talkTopics = [];
    }

    location.talkTopics.push(dialogueId);
  }

  public getTalkTopicsAt(locationId: string): Dialogue[] {
    const location = this.locations.get(locationId);
    if (!location || !location.talkTopics) {
      return [];
    }
    const dialogueIds = location.talkTopics;
    let dialogues = [];
    for (const dialogueId of dialogueIds) {
      const dialogue = this.talkTopics.get(dialogueId);
      dialogue && dialogues.push(dialogue);
    }
    return dialogues;
  }

  public setObjectsAt(locationId: string, objectPropertyMap: Map<ObjectId, ObjectProperty>) {
    const location = this.locations.get(locationId);
    if (!location) {
      return;
    }

    location.objects = objectPropertyMap;
  }

  public getObjectsAt(locationId: string): Map<ObjectId, ObjectProperty> | undefined {
    const location = this.locations.get(locationId);
    if (!location) {
      return;
    }
    return location.objects;
  }

  public setBoundingBoxes(locationId: string, bboxId: BBoxId, bboxProperty: BBoxProperty) {
    const location = this.locations.get(locationId);
    if (!location) return;

    if (!location.boundingBoxes) {
      location.boundingBoxes = new Map<BBoxId, BBoxProperty>();
    }

    location.boundingBoxes.set(bboxId, bboxProperty);
  }
}

export default GameMap;
