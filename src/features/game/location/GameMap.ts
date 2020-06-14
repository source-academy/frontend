import { GameLocation, GameItemType, LocationId } from '../location/GameMapTypes';
import { ItemId, AssetKey, AssetPath } from '../commons/CommonsTypes';
import { Dialogue } from '../dialogue/GameDialogueTypes';
import { ObjectProperty } from '../objects/GameObjectTypes';
import { BBoxProperty } from '../boundingBoxes/BoundingBoxTypes';
import { GameMode } from '../mode/GameModeTypes';
import { showLocationError } from '../utils/Error';
import { Character } from '../character/GameCharacterTypes';

class GameMap {
  private mapAssets: Map<AssetKey, AssetPath>;

  private locations: Map<LocationId, GameLocation>;
  private talkTopics: Map<ItemId, Dialogue>;
  private objects: Map<ItemId, ObjectProperty>;
  private boundingBoxes: Map<ItemId, BBoxProperty>;
  private characters: Map<ItemId, Character>;

  constructor() {
    this.mapAssets = new Map<AssetKey, AssetPath>();

    this.locations = new Map<LocationId, GameLocation>();
    this.talkTopics = new Map<ItemId, Dialogue>();
    this.objects = new Map<ItemId, ObjectProperty>();
    this.boundingBoxes = new Map<ItemId, BBoxProperty>();
    this.characters = new Map<ItemId, Character>();
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

  public setModesAt(id: LocationId, modes: GameMode[]) {
    const location = this.locations.get(id);
    if (!location) {
      showLocationError(id);
      return;
    }

    location.modes = modes;
  }

  public setNavigationFrom(id: string, destination: string[]) {
    const location = this.locations.get(id);
    if (!location) {
      showLocationError(id);
      return;
    }

    location.navigation = destination;
  }

  public getNavigationFrom(id: string): string[] | undefined {
    const location = this.locations.get(id);
    if (!location || !location.navigation) {
      showLocationError(id);
      return;
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

  public getBBox(): Map<ItemId, BBoxProperty> {
    return this.boundingBoxes;
  }

  public getDialogues(): Map<ItemId, Dialogue> {
    return this.talkTopics;
  }

  public getCharacters(): Map<ItemId, Character> {
    return this.characters;
  }

  public addItemToMap<T>(itemType: GameItemType<T>, itemId: string, item: T) {
    this[itemType.listName].set(itemId, item);
  }

  public setItemAt<T>(locationId: string, itemType: GameItemType<T>, itemId: string) {
    const location = this.locations.get(locationId);
    if (!location) {
      showLocationError(locationId);
      return;
    }

    if (!location[itemType.listName]) {
      location[itemType.listName] = [];
    }
    location[itemType.listName].push(itemId);
  }

  public getItemAt<T>(locationId: string, itemType: GameItemType<T>): Map<ItemId, T> {
    const location = this.locations.get(locationId);
    if (!location) {
      showLocationError(locationId);
      return itemType.emptyMap;
    }
    if (!location[itemType.listName]) {
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
    console.log(this.talkTopics && this.objects && this.boundingBoxes && this.characters);
  }
}

export default GameMap;
