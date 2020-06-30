import { GameLocation, LocationId, GameLocationAttr } from '../location/GameMapTypes';
import { ItemId, AssetKey, AssetPath, SoundAsset } from '../commons/CommonsTypes';
import { Dialogue } from '../dialogue/GameDialogueTypes';
import { ObjectProperty } from '../objects/GameObjectTypes';
import { BBoxProperty } from '../boundingBoxes/GameBoundingBoxTypes';
import { GameMode } from '../mode/GameModeTypes';
import { Character } from '../character/GameCharacterTypes';
import { GameAction } from '../action/GameActionTypes';
import { CollectibleProperty } from '../collectibles/CollectiblesTypes';

class GameMap {
  private soundAssets: SoundAsset[];
  private mapAssets: Map<AssetKey, AssetPath>;

  private locations: Map<LocationId, GameLocation>;
  private talkTopics: Map<ItemId, Dialogue>;
  private objects: Map<ItemId, ObjectProperty>;
  private boundingBoxes: Map<ItemId, BBoxProperty>;
  private characters: Map<ItemId, Character>;
  private actions: Map<ItemId, GameAction>;
  private collectibles: Map<ItemId, CollectibleProperty>;

  constructor() {
    this.soundAssets = [];
    this.mapAssets = new Map<AssetKey, AssetPath>();

    this.locations = new Map<LocationId, GameLocation>();
    this.talkTopics = new Map<ItemId, Dialogue>();
    this.objects = new Map<ItemId, ObjectProperty>();
    this.boundingBoxes = new Map<ItemId, BBoxProperty>();
    this.characters = new Map<ItemId, Character>();
    this.actions = new Map<ItemId, GameAction>();
    this.collectibles = new Map<ItemId, CollectibleProperty>();
  }

  public addSoundAsset(soundAsset: SoundAsset) {
    this.soundAssets.push(soundAsset);
  }

  public addMapAsset(assetKey: AssetKey, assetPath: AssetPath) {
    this.mapAssets.set(assetKey, assetPath);
  }

  public getMapAssets(): Map<AssetKey, AssetPath> {
    return this.mapAssets;
  }

  public addLocation(locationId: LocationId, location: GameLocation): void {
    this.locations.set(locationId, location);
  }

  public setModesAt(id: LocationId, modes: GameMode[]) {
    return (this.getLocationAtId(id).modes = modes);
  }

  public setNavigationFrom(id: LocationId, navigation: string[]) {
    this.getLocationAtId(id).navigation = navigation;
  }

  public getNavigationFrom(id: LocationId): string[] | undefined {
    return this.getLocationAtId(id).navigation;
  }

  public getLocations(): Map<LocationId, GameLocation> {
    return this.locations;
  }

  public getObjects(): Map<ItemId, ObjectProperty> {
    return this.objects;
  }

  public getBBoxes(): Map<ItemId, BBoxProperty> {
    return this.boundingBoxes;
  }

  public getDialogues(): Map<ItemId, Dialogue> {
    return this.talkTopics;
  }

  public getCharacters(): Map<ItemId, Character> {
    return this.characters;
  }

  public getActions(): Map<ItemId, GameAction> {
    return this.actions;
  }

  public getSoundAssets(): SoundAsset[] {
    return this.soundAssets;
  }

  public getCollectibles(): Map<ItemId, CollectibleProperty> {
    return this.collectibles;
  }

  public addItemToMap<T>(listName: GameLocationAttr, itemId: string, item: T) {
    this[listName].set(itemId, item);
  }

  public setItemAt<T>(locationId: LocationId, listName: GameLocationAttr, itemId: string) {
    const location = this.getLocationAtId(locationId);

    if (!location[listName]) {
      location[listName] = [];
    }
    location[listName].push(itemId);
  }

  public setBGMusicAt(locationId: LocationId, soundKey: AssetKey) {
    const location = this.getLocationAtId(locationId);
    location.bgmKey = soundKey;
  }

  public getLocationAtId(locationId: LocationId): GameLocation {
    const location = this.locations.get(locationId);
    if (!location) {
      throw new Error(`Location ${locationId} was not found`);
    }
    return location;
  }
}

export default GameMap;
