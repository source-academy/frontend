import { GameLocation } from '../location/GameMapTypes';
import { GameImage, DialogueId, ObjectId } from '../commons/CommonsTypes';
import { Dialogue } from '../dialogue/DialogueTypes';
import { ObjectProperty, ObjectPropertyMap } from '../objects/ObjectsTypes';

class GameMap {
  private locationAssets: Map<string, GameImage>;
  private navigation: Map<string, string[]>;
  private locations: Map<string, GameLocation>;
  private talkTopics: Map<DialogueId, Dialogue>;
  private objects: Map<ObjectId, ObjectProperty>;
  private boundingBoxes: Map<BoxId, BoundingBox>;

  constructor() {
    this.locationAssets = new Map<string, GameImage>();
    this.navigation = new Map<string, string[]>();
    this.locations = new Map<string, GameLocation>();
    this.talkTopics = new Map<DialogueId, Dialogue>();
    this.objects = new Map<ObjectId, ObjectProperty>();
    this.boundingBoxes = new Map<BoxId, BoundingBox>();
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

  public setObjectAt(locationId: string, objectId: ObjectId, objectProperty: ObjectProperty) {
    this.objects.set(objectId, objectProperty);

    const location = this.locations.get(locationId);
    if (!location) return;

    if (!location.objects) {
      location.objects = [];
    }

    location.objects.push(objectId);
  }

  public getObjectsAt(locationId: string): ObjectPropertyMap {
    const location = this.locations.get(locationId);
    let objectPropertyMap = new Map<ObjectId, ObjectProperty>();
    if (!location || !location.objects) {
      return objectPropertyMap;
    }
    const objectIds = location.objects;
    for (const objectId of objectIds) {
      const object = this.objects.get(objectId);
      object && objectPropertyMap.set(objectId, object);
    }
    return objectPropertyMap;
  }
}

export default GameMap;
