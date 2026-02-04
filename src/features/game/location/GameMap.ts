import { GameAction } from '../action/GameActionTypes';
import { ImageAsset, SoundAsset } from '../assets/AssetsTypes';
import { BBoxProperty } from '../boundingBoxes/GameBoundingBoxTypes';
import { Character } from '../character/GameCharacterTypes';
import { AssetKey, ItemId } from '../commons/CommonTypes';
import { Dialogue } from '../dialogue/GameDialogueTypes';
import { GameMode } from '../mode/GameModeTypes';
import { ObjectProperty } from '../objects/GameObjectTypes';
import { Quiz } from '../quiz/GameQuizType';
import { mandatory } from '../utils/GameUtils';
import { AnyId, GameItemType, GameLocation, LocationId } from './GameMapTypes';

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
  private mapAssets: Map<AssetKey, ImageAsset>;
  private locations: Map<LocationId, GameLocation>;
  private dialogues: Map<ItemId, Dialogue>;
  private objects: Map<ItemId, ObjectProperty>;
  private boundingBoxes: Map<ItemId, BBoxProperty>;
  private characters: Map<ItemId, Character>;
  private actions: Map<ItemId, GameAction>;
  private gameStartActions: ItemId[];
  private checkpointCompleteActions: ItemId[];
  private quizzes: Map<ItemId, Quiz>;

  constructor() {
    this.soundAssets = [];
    this.mapAssets = new Map<AssetKey, ImageAsset>();

    this.locations = new Map<LocationId, GameLocation>();
    this.dialogues = new Map<ItemId, Dialogue>();
    this.objects = new Map<ItemId, ObjectProperty>();
    this.boundingBoxes = new Map<ItemId, BBoxProperty>();
    this.characters = new Map<ItemId, Character>();
    this.actions = new Map<ItemId, GameAction>();
    this.quizzes = new Map<ItemId, Quiz>();

    this.gameStartActions = [];
    this.checkpointCompleteActions = [];
  }

  public addSoundAsset(soundAsset: SoundAsset) {
    this.soundAssets.push(soundAsset);
  }

  public addMapAsset(assetKey: AssetKey, imageAsset: ImageAsset) {
    this.mapAssets.set(assetKey, imageAsset);
  }

  public getMapAssets(): Map<AssetKey, ImageAsset> {
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

  public setGameStartActions(actionIds: ItemId[]) {
    this.gameStartActions = actionIds;
  }

  public setCheckpointCompleteActions(actionIds: ItemId[]) {
    this.checkpointCompleteActions = actionIds;
  }

  public getGameStartActions() {
    return this.gameStartActions;
  }

  public getCheckpointCompleteActions() {
    return this.checkpointCompleteActions;
  }

  public getLocations(): Map<LocationId, GameLocation> {
    return this.locations;
  }

  public getObjectPropMap(): Map<ItemId, ObjectProperty> {
    return this.objects;
  }

  public getBBoxPropMap(): Map<ItemId, BBoxProperty> {
    return this.boundingBoxes;
  }

  public getDialogueMap(): Map<ItemId, Dialogue> {
    return this.dialogues;
  }

  public getCharacterMap(): Map<ItemId, Character> {
    return this.characters;
  }

  public getActionMap(): Map<ItemId, GameAction> {
    return this.actions;
  }

  public getQuizMap(): Map<ItemId, Quiz> {
    return this.quizzes;
  }

  public getSoundAssets(): SoundAsset[] {
    return this.soundAssets;
  }

  public setItemInMap(gameItemType: GameItemType, itemId: string, item: any) {
    // @ts-expect-error TS 5.0, violating abstraction of class and object using .set
    this[gameItemType].set(itemId, item);
  }

  public addItemToLocation(locId: LocationId, gameItemType: GameItemType, itemId: string) {
    const location = this.getLocationAtId(locId);
    const items = location[gameItemType as keyof typeof location];
    (items as Set<any>).add(itemId);
  }

  public setBGMusicAt(locId: LocationId, soundKey: AssetKey) {
    this.getLocationAtId(locId).bgmKey = soundKey;
  }

  public getLocationAtId = (locId: LocationId) =>
    mandatory(this.locations.get(locId), `Location ${locId} was not found!`);

  public getAssetByKey = (key: AssetKey) =>
    mandatory(this.mapAssets.get(key), `Asset ${key} not found!`);

  public getLocationIds(): LocationId[] {
    return Array.from(this.locations.keys());
  }

  public getAssetKeyFromId(id: AnyId): AssetKey {
    return mandatory(
      this.objects.get(id)?.assetKey || this.locations.get(id)?.assetKey,
      `Id ${id} not found!`
    );
  }
}

export default GameMap;
