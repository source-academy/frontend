import { GameAction } from '../action/GameActionTypes';
import { SoundAsset } from '../assets/AssetsTypes';
import { BBoxProperty } from '../boundingBoxes/GameBoundingBoxTypes';
import { Character } from '../character/GameCharacterTypes';
import { AssetKey, AssetPath, ItemId } from '../commons/CommonTypes';
import { Dialogue } from '../dialogue/GameDialogueTypes';
import { GameLocation, GameLocationAttr, LocationId } from '../location/GameMapTypes';
import { GameMode } from '../mode/GameModeTypes';
import { ObjectProperty } from '../objects/GameObjectTypes';
import { mandatory } from '../utils/GameUtils';

/**
 * Game map is the class that encapsulates data about
 * all the locations and items in the map in a checkpoint
 *
 * Mainly used by game checkpoint.
 *
 * All possible assets should be stored within the soundAssets
 * and mapAssets; while mapping from ItemId to other properties
 * are stored separately.
 *
 * Lastly, the GameLocation should only refer to the ItemIDs,
 * and not the actual property.
 *
 * GameManager, along other managers, will process this class
 * as when as its needed.
 */
class GameMap {
  private soundAssets: SoundAsset[];
  private mapAssets: Map<AssetKey, AssetPath>;

  private locations: Map<LocationId, GameLocation>;
  private talkTopics: Map<ItemId, Dialogue>;
  private objects: Map<ItemId, ObjectProperty>;
  private boundingBoxes: Map<ItemId, BBoxProperty>;
  private characters: Map<ItemId, Character>;
  private actions: Map<ItemId, GameAction>;
  private startActions: ItemId[];
  private endActions: ItemId[];

  constructor() {
    this.soundAssets = [];
    this.mapAssets = new Map<AssetKey, AssetPath>();

    this.locations = new Map<LocationId, GameLocation>();
    this.talkTopics = new Map<ItemId, Dialogue>();
    this.objects = new Map<ItemId, ObjectProperty>();
    this.boundingBoxes = new Map<ItemId, BBoxProperty>();
    this.characters = new Map<ItemId, Character>();
    this.actions = new Map<ItemId, GameAction>();
    this.startActions = [];
    this.endActions = [];
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
    this.getLocationAtId(id).modes = new Set(modes);
  }

  public setNavigationFrom(id: LocationId, navigation: string[]) {
    this.getLocationAtId(id).navigation = new Set(navigation);
  }

  public getNavigationFrom(id: LocationId): Set<string> | undefined {
    return this.getLocationAtId(id).navigation;
  }

  public setStartActions(actionIds: ItemId[]) {
    this.startActions = actionIds;
  }

  public setEndActions(actionIds: ItemId[]) {
    this.endActions = actionIds;
  }

  public getStartActions() {
    return this.startActions;
  }

  public getEndActions() {
    return this.endActions;
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

  public addItemToMap<T>(listName: GameLocationAttr, itemId: string, item: T) {
    this[listName].set(itemId, item);
  }

  public setItemAt<T>(locId: LocationId, listName: GameLocationAttr, itemId: string) {
    const location = this.getLocationAtId(locId);
    location[listName].add(itemId);
  }

  public setBGMusicAt(locId: LocationId, soundKey: AssetKey) {
    const location = this.getLocationAtId(locId);
    location.bgmKey = soundKey;
  }

  public getLocationAtId = (locId: LocationId) =>
    mandatory(this.locations.get(locId), `Location ${locId} was not found!`);
}

export default GameMap;
