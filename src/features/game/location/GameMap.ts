import { GameLocation, GameItemType, LocationId } from '../location/GameMapTypes';
import { GameMapItem, ItemId, AssetKey, AssetPath } from '../commons/CommonsTypes';
import { Dialogue } from '../dialogue/DialogueTypes';
import { ObjectProperty } from '../objects/GameObjectTypes';
import { BBoxProperty } from '../boundingBoxes/BoundingBoxTypes';

class GameMap {
  private mapAssets: Map<AssetKey, AssetPath>;

  private locations: Map<LocationId, GameLocation>;
  private talkTopics: Map<ItemId, Dialogue>;
  private objects: Map<ItemId, ObjectProperty>;
  private boundingBoxes: Map<ItemId, BBoxProperty>;

  constructor() {
    this.locations = new Map<LocationId, GameLocation>();

    this.mapAssets = new Map<AssetKey, AssetPath>();
    this.talkTopics = new Map<ItemId, Dialogue>();
    this.talkTopics = new Map<ItemId, Dialogue>();
    this.boundingBoxes = new Map<ItemId, BBoxProperty>();
    
  }

  public addMapAsset(assetKey: AssetKey, assetPath: AssetPath) {
    this.mapAssets.set(assetKey, assetPath);
  }

  public getMapAssets(): Map<AssetKey, AssetPath> {
    return this.mapAssets;
  }

  public addLocation(locationId: string, location: GameLocation): void {
    this.locations.set(locationId, location);
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

  public getLocation(id: string): GameLocation | undefined {
    return this.locations.get(id);
  }

  public getLocations(): Map<string, GameLocation> {
    return this.locations;
  }

  public getObjects(): Map<ItemId, ObjectProperty> {
    return this.objects;
  }

  public addItemToMap<T>(itemType: GameItemType<T>, itemId: string, item: GameMapItem) {
    this[itemType.listName].set(itemId, item);
  }

  public setItemAt<T>(locationId: string, itemType: GameItemType<T>, itemId: string) {
    const location = this.locations.get(locationId);
    if (!location) return;

    if (!location[itemType.listName]) {
      location[itemType.listName] = [];
    }
    location[itemType.listName].push(itemId);
  }

  public getItemAt<T>(locationId: string, itemType: GameItemType<T>): Map<ItemId, T> {
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

  public useGameMapItems() {
    // Escape typescript warnings
    console.log(this.talkTopics && this.objects && this.boundingBoxes);
  }
}

export default GameMap;
