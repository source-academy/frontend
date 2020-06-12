import { GameLocation, GameItemType } from '../location/GameMapTypes';
import {
  GameImage,
  DialogueId,
  ObjectId,
  BBoxId,
  GameMapItem,
  ItemId
} from '../commons/CommonsTypes';
import { Dialogue } from '../dialogue/DialogueTypes';
import { ObjectProperty } from '../objects/ObjectsTypes';
import { BBoxProperty } from '../boundingBoxes/BoundingBoxTypes';

class GameMap {
  private locations: Map<string, GameLocation>;

  private locationAssets: Map<string, GameImage>;
  private talkTopics: Map<DialogueId, Dialogue>;
  private objects: Map<ObjectId, ObjectProperty>;
  private boundingBoxes: Map<BBoxId, BBoxProperty>;

  constructor() {
    this.locationAssets = new Map<string, GameImage>();
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
    const location = this.locations.get(id);
    if (!location) return;

    location.navigation = destination;
  }

  public getNavigationFrom(id: string): string[] | undefined {
    const location = this.locations.get(id);
    if (!location || !location.navigation) {
      return undefined;
    }
    return location.navigation;
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

  public setItemAt<T>(
    locationId: string,
    itemType: GameItemType<T>,
    itemId: string,
    item: GameMapItem
  ) {
    // Add item to Map
    this[itemType.listName].set(itemId, item);

    // Add item to location
    const location = this.locations.get(locationId);
    if (!location) return;

    if (!location[itemType.listName]) {
      location[itemType.listName] = [];
    }
    location[itemType.listName].push(itemId);
  }

  public getItemAt<T>(locationId: string, itemType: GameItemType<T>) {
    const location = this.locations.get(locationId);
    if (!location || !location[itemType.listName]) {
      return itemType.emptyMap;
    }

    const itemIds = location[itemType.listName];
    const items = new Map<ItemId, T>();
    itemIds.forEach((itemId: ItemId) => {
      const item = this[itemType.listName].get(itemId);
      items.set(itemId, item);
    });
    return items;
  }
}

export default GameMap;
