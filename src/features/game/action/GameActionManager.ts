import GameManager from '../scenes/gameManager/GameManager';
import { GameMode } from 'src/features/game/mode/GameModeTypes';
import { GameLocationAttr, LocationId, GameLocation } from '../location/GameMapTypes';
import { ItemId } from '../commons/CommonsTypes';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { ObjectProperty } from '../objects/GameObjectTypes';
import { BBoxProperty } from '../boundingBoxes/GameBoundingBoxTypes';
import { PopUpPosition } from '../popUp/GamePopUpTypes';
import { displayNotification } from '../effects/Notification';
import { AssetKey } from '../commons/CommonsTypes';
import { StateObserver } from '../state/GameStateTypes';

class GameActionManager {
  private gameManager: GameManager | undefined;

  static instance: GameActionManager;

  private constructor() {
    this.gameManager = undefined;
  }

  static getInstance() {
    if (!GameActionManager.instance) {
      GameActionManager.instance = new GameActionManager();
    }
    return GameActionManager.instance;
  }

  /////////////////////
  //   Game Manager  //
  /////////////////////

  public getGameManager(): GameManager {
    if (!this.gameManager) {
      throw new Error('Game Manager not found');
    }
    return this.gameManager;
  }

  public setGameManager(gameManagerRef: GameManager): void {
    this.gameManager = gameManagerRef;
  }

  public getCurrLocId(): LocationId {
    return this.getGameManager().currentLocationId;
  }

  public getLocationAtId(locationId: LocationId): GameLocation {
    return this.getGameManager().currentChapter.map.getLocationAtId(locationId);
  }
  /////////////////////
  //    Game Mode    //
  /////////////////////

  public getModesByLocId(locationId: LocationId): GameMode[] {
    return this.getGameManager().stateManager.getLocationMode(locationId);
  }

  public addLocationMode(locationId: LocationId, mode: GameMode): void {
    if (this.gameManager) {
      this.gameManager.stateManager.addLocationMode(locationId, mode);
    }
  }

  public removeLocationMode(locationId: LocationId, mode: GameMode): void {
    if (this.gameManager) {
      this.gameManager.stateManager.removeLocationMode(locationId, mode);
    }
  }

  /////////////////////
  //  Game Locations //
  /////////////////////

  public hasLocationUpdate(locationId: LocationId, mode?: GameMode): boolean | undefined {
    if (this.gameManager) {
      return this.gameManager.stateManager.hasLocationUpdate(locationId, mode);
    }
    return false;
  }

  public changeLocationTo(locationName: string) {
    if (this.gameManager) {
      return this.gameManager.changeLocationTo(locationName);
    }
    return;
  }

  /////////////////////
  //   Interaction   //
  /////////////////////

  public hasTriggeredInteraction(id: string): boolean | undefined {
    if (this.gameManager) {
      return this.gameManager.stateManager.hasTriggeredInteraction(id);
    }
    return undefined;
  }

  public triggerInteraction(id: string): void {
    if (this.gameManager) {
      return this.gameManager.stateManager.triggerInteraction(id);
    }
    return undefined;
  }

  /////////////////////
  //    Game Attr    //
  /////////////////////

  public getLocationAttr(attr: GameLocationAttr, locationId: LocationId) {
    if (this.gameManager) {
      return this.gameManager.stateManager.getLocationAttr(attr, locationId);
    }
    return undefined;
  }

  public addLocationAttr(attr: GameLocationAttr, locationId: LocationId, attrElem: string): void {
    if (this.gameManager) {
      return this.gameManager.stateManager.addLocationAttr(attr, locationId, attrElem);
    }
    return;
  }

  public removeLocationAttr(
    attr: GameLocationAttr,
    locationId: LocationId,
    attrElem: string
  ): void {
    if (this.gameManager) {
      return this.gameManager.stateManager.removeLocationAttr(attr, locationId, attrElem);
    }
    return;
  }

  public subscribeState(observer: StateObserver) {
    if (this.gameManager) {
      this.gameManager.stateManager.subscribe(observer);
    }
  }

  public unsubscribeState(observer: StateObserver) {
    if (this.gameManager) {
      this.gameManager.stateManager.unsubscribe(observer);
    }
  }

  /////////////////////
  //  Game Objects   //
  /////////////////////

  public addInteractiveObjectsListeners(
    locationId: LocationId,
    event: string | symbol,
    fn: (id: ItemId) => void
  ) {
    if (this.gameManager) {
      this.gameManager.objectManager.addInteractiveObjectsListeners(locationId, event, fn);
    }
  }

  public removeInteractiveObjectListeners(locationId: LocationId, event: string | symbol) {
    if (this.gameManager) {
      this.gameManager.objectManager.removeInteractiveObjectListeners(locationId, event);
    }
  }

  public getObjPropertyMap() {
    if (this.gameManager) {
      return this.gameManager.stateManager.getObjPropertyMap();
    }
    return new Map<ItemId, ObjectProperty>();
  }

  public setObjProperty(id: ItemId, newObjProp: ObjectProperty) {
    if (this.gameManager) {
      const currLocName = this.gameManager.currentLocationId;
      this.gameManager.stateManager.setObjProperty(currLocName, id, newObjProp);
    }
  }

  /////////////////////
  //    Game BBox    //
  /////////////////////

  public addInteractiveBBoxListeners(
    locationId: LocationId,
    event: string | symbol,
    fn: (id: ItemId) => void
  ) {
    if (this.gameManager) {
      this.gameManager.boundingBoxManager.addInteractiveBBoxListeners(locationId, event, fn);
    }
  }

  public removeInteractiveBBoxListeners(locationId: LocationId, event: string | symbol) {
    if (this.gameManager) {
      this.gameManager.boundingBoxManager.removeInteractiveBBoxListeners(locationId, event);
    }
  }

  public getBBoxPropertyMap() {
    if (this.gameManager) {
      return this.gameManager.stateManager.getBBoxPropertyMap();
    }
    return new Map<ItemId, BBoxProperty>();
  }

  public setBBoxProperty(id: ItemId, newBBoxProp: BBoxProperty) {
    if (this.gameManager) {
      const currLocName = this.gameManager.currentLocationId;
      this.gameManager.stateManager.setBBoxProperty(currLocName, id, newBBoxProp);
    }
  }

  /////////////////////
  //  Game Objective //
  /////////////////////

  public isAllComplete(): boolean {
    if (this.gameManager) {
      return this.gameManager.stateManager.isAllComplete();
    }
    return false;
  }

  public isObjectiveComplete(key: string): boolean {
    if (this.gameManager) {
      return this.gameManager.stateManager.isObjectiveComplete(key);
    }
    return false;
  }

  public areObjectivesComplete(keys: string[]): boolean {
    if (this.gameManager) {
      return this.gameManager.stateManager.areObjectivesComplete(keys);
    }
    return false;
  }

  public completeObjective(key: string): void {
    if (this.gameManager) {
      return this.gameManager.stateManager.completeObjective(key);
    }
  }

  /////////////////////
  //   User State    //
  /////////////////////

  public addToUserStateList(listName: string, id: string): void {
    if (this.gameManager) {
      return this.gameManager.userStateManager.addToList(listName, id);
    }
  }

  public existsInUserStateList(listName: string, id: string): boolean {
    if (this.gameManager) {
      return this.gameManager.userStateManager.doesIdExistInList(listName, id);
    }
    return false;
  }

  /////////////////////
  //   Game Layer    //
  /////////////////////

  public clearSeveralLayers(layerTypes: Layer[], withFade = false) {
    if (this.gameManager) {
      this.gameManager.layerManager.clearSeveralLayers(layerTypes, withFade);
    }
  }

  public addContainerToLayer(layer: Layer, gameObj: Phaser.GameObjects.GameObject) {
    if (this.gameManager) {
      this.gameManager.layerManager.addToLayer(layer, gameObj);
    }
  }

  public getDialogue(dialogueId: ItemId) {
    return this.getGameManager().currentChapter.map.getDialogues().get(dialogueId);
  }

  /////////////////////
  //  Location Notif //
  /////////////////////

  public async bringUpUpdateNotif(message: string) {
    if (this.gameManager) {
      await displayNotification(message);
    }
  }

  /////////////////////
  //   Story Action  //
  /////////////////////

  public async executeStoryAction(actionIds: ItemId[] | undefined) {
    await this.getGameManager().actionExecuter.executeStoryActions(actionIds);
  }

  /////////////////////
  //   Collectible   //
  /////////////////////

  public async obtainCollectible(collectibleId: string) {
    if (this.gameManager) {
      this.gameManager.userStateManager.addToList('collectibles', collectibleId);
    }
  }

  /////////////////////
  //     Pop Up      //
  /////////////////////

  public displayPopUp(itemId: ItemId, position: PopUpPosition, duration?: number) {
    if (this.gameManager) {
      this.gameManager.popUpManager.displayPopUp(itemId, position, duration);
    }
  }

  public destroyAllPopUps() {
    if (this.gameManager) {
      this.gameManager.popUpManager.destroyAllPopUps();
    }
  }

  public async destroyPopUp(position: PopUpPosition) {
    if (this.gameManager) {
      this.gameManager.popUpManager.destroyPopUp(position);
    }
  }

  /////////////////////
  //    Save Game    //
  /////////////////////

  public async saveGame() {
    await this.getGameManager().saveManager.saveGame();
  }

  /////////////////////
  //      Sound      //
  /////////////////////

  public playSound(soundKey: AssetKey) {
    if (this.gameManager) {
      this.gameManager.soundManager.playSound(soundKey);
    }
  }

  public playBgMusic(soundKey: AssetKey) {
    if (this.gameManager) {
      this.gameManager.soundManager.playSound(soundKey);
    }
  }

  public async stopCurrBgMusic(fadeDuration?: number) {
    if (this.gameManager) {
      this.gameManager.soundManager.stopCurrBgMusic(fadeDuration);
    }
  }

  public async stopAllSound() {
    if (this.gameManager) {
      this.gameManager.soundManager.stopAllSound();
    }
  }

  public pauseCurrBgMusic() {
    if (this.gameManager) {
      this.gameManager.soundManager.pauseCurrBgMusic();
    }
  }

  public continueCurrBgMusic() {
    if (this.gameManager) {
      this.gameManager.soundManager.continueCurrBgMusic();
    }
  }

  /////////////////////
  //      Input      //
  /////////////////////

  public enableKeyboardInput(active: boolean) {
    this.getGameManager().input.keyboard.enabled = active;
  }
}

export default GameActionManager;
