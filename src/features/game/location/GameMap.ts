import { GameLocation, GameMapItemType } from '../location/GameMapTypes';
import { GameImage, DialogueId, ObjectId, BBoxId, GameMapItem } from '../commons/CommonsTypes';
import { Dialogue } from '../dialogue/DialogueTypes';
import { ObjectProperty } from '../objects/ObjectsTypes';
import { BBoxProperty } from '../boundingBoxes/BoundingBoxTypes';

class GameMap {
  private locationAssets: Map<string, GameImage>;
  private navigation: Map<string, string[]>;
  private locations: Map<string, GameLocation>;
  private talkTopics: Map<DialogueId, Dialogue>;
  private objects: Map<ObjectId, ObjectProperty>;
  private boundingBoxes: Map<BBoxId, BBoxProperty>;

  constructor() {
    this.locationAssets = new Map<string, GameImage>();
    this.navigation = new Map<string, string[]>();
    this.locations = new Map<string, GameLocation>();
    this.talkTopics = new Map<DialogueId, Dialogue>();
    this.objects = new Map<ObjectId, ObjectProperty>();
    this.boundingBoxes = new Map<BBoxId, BBoxProperty>();
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

  public useGameMapItems() {
    // Escape typescript warnings
    console.log(this.talkTopics && this.objects && this.boundingBoxes);
  }

  public setItemAt(locationId: string, type: GameMapItemType, itemId: string, item: GameMapItem) {
    // Escape typescript warnings
    this[type + ''].set(itemId, item);

    const location = this.locations.get(locationId);
    if (!location) return;
    if (!location[type]) {
      location[type] = [];
    }

    location[type].push(itemId);
  }

  public getItemAt(locationId: string, type: GameMapItemType): GameMapItem[] {
    const location = this.locations.get(locationId);
    if (!location || !location[type]) {
      return [];
    }
    const itemIds = location[type];
    const items: GameMapItem[] = [];
    for (const itemId of itemIds) {
      const item = this[type + ''].get(itemId);
      item && item.push(item);
    }
    return items;
  }
}

export default GameMap;
