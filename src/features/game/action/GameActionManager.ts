import GameManager from '../scenes/gameManager/GameManager';
import { GameMode, GamePhase } from 'src/features/game/mode/GameModeTypes';
import { GameLocationAttr, LocationId } from '../location/GameMapTypes';
import { ItemId } from '../commons/CommonsTypes';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { GameAction } from './GameActionTypes';
import { SpeakerDetail } from '../character/GameCharacterTypes';
import { ObjectProperty } from '../objects/GameObjectTypes';
import { BBoxProperty } from '../boundingBoxes/GameBoundingBoxTypes';
import { PopUpPosition } from '../popUp/GamePopUpTypes';

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

  /////////////////////
  //    Game Mode    //
  /////////////////////

  public getLocationMode(locationId: LocationId): GameMode[] | undefined {
    if (this.gameManager) {
      return this.gameManager.stateManager.getLocationMode(locationId);
    }
    return undefined;
  }

  public addLocationMode(locationId: LocationId, mode: GameMode): void {
    if (this.gameManager) {
      this.gameManager.modeManager.addMode(locationId, mode);
      this.gameManager.stateManager.addLocationMode(locationId, mode);
    }
  }

  public removeLocationMode(locationId: LocationId, mode: GameMode): void {
    if (this.gameManager) {
      this.gameManager.modeManager.removeMode(locationId, mode);
      this.gameManager.stateManager.removeLocationMode(locationId, mode);
    }
  }

  public changeLocationModeTo(
    newMode: GameMode,
    refresh?: boolean,
    skipDeactivate?: boolean
  ): void {
    if (this.gameManager) {
      return this.gameManager.changeModeTo(newMode, refresh, skipDeactivate);
    }
    return;
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

  /////////////////////
  //  Game Objects   //
  /////////////////////

  public addInteractiveObjectsListeners(
    locationId: LocationId,
    event: string | symbol,
    fn: (id: ItemId) => void
  ) {
    console.log('here');
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

  public addContainerToLayer(layer: Layer, gameObj: Phaser.GameObjects.GameObject) {
    if (this.gameManager) {
      this.gameManager.layerManager.addToLayer(layer, gameObj);
    }
  }

  public deactivateCurrentUI() {
    if (this.gameManager) {
      this.gameManager.deactivateCurrentUI();
    }
  }

  public activateCurrentUI() {
    if (this.gameManager) {
      this.gameManager.activateCurrentUI();
    }
  }

  /////////////////////
  //     Dialogue    //
  /////////////////////

  public async bringUpDialogue(dialogueId: ItemId) {
    if (this.gameManager) {
      this.deactivateCurrentUI();
      this.gameManager.setActivePhase(GamePhase.Dialogue);
      await this.gameManager.dialogueManager.playDialogue(dialogueId);
      this.gameManager.setActivePhase(GamePhase.Standard);
      this.activateCurrentUI();
    }
  }

  /////////////////////
  //     Speaker     //
  /////////////////////

  public async changeSpeaker(speakerDetail: SpeakerDetail | undefined | null) {
    if (this.gameManager) {
      this.gameManager.characterManager.changeSpeakerTo(speakerDetail);
    }
  }

  /////////////////////
  //   Story Action  //
  /////////////////////

  public async executeStoryAction(actions: GameAction[]) {
    if (this.gameManager) {
      await this.gameManager.actionExecuter.executeStoryActions(actions);
    }
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
}

export default GameActionManager;
