import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { GameMode } from 'src/features/game/mode/GameModeTypes';

import { GameAction } from '../../action/GameActionTypes';
import { SoundAsset } from '../../assets/AssetsTypes';
import { BBoxProperty } from '../../boundingBoxes/GameBoundingBoxTypes';
import { Character } from '../../character/GameCharacterTypes';
import { GamePosition, ItemId } from '../../commons/CommonTypes';
import { AssetKey } from '../../commons/CommonTypes';
import { Dialogue } from '../../dialogue/GameDialogueTypes';
import { displayNotification } from '../../effects/Notification';
import { GameItemType, GameLocation, LocationId } from '../../location/GameMapTypes';
import { ActivateSpriteCallbacks, ObjectProperty } from '../../objects/GameObjectTypes';
import { GamePhaseType } from '../../phase/GamePhaseTypes';
import { SettingsJson } from '../../save/GameSaveTypes';
import SourceAcademyGame from '../../SourceAcademyGame';
import { StateObserver } from '../../state/GameStateTypes';
import { mandatory } from '../../utils/GameUtils';
import GameManager from './GameManager';

/**
 * This class exposes all the public API's of managers
 * in the Game Manager scene.
 *
 * It allows managers to access services globally
 * through GameGlobalAPI.getInstance().function() without
 * having to keep a reference to the gameManager.
 */
class GameGlobalAPI {
  private gameManager: GameManager | undefined;

  static instance: GameGlobalAPI;

  private constructor() {
    this.gameManager = undefined;
  }

  static getInstance() {
    if (!GameGlobalAPI.instance) {
      GameGlobalAPI.instance = new GameGlobalAPI();
    }
    return GameGlobalAPI.instance;
  }

  /////////////////////
  //   Game Manager  //
  /////////////////////

  public getGameManager = () => mandatory(this.gameManager);

  public setGameManager(gameManagerRef: GameManager): void {
    this.gameManager = gameManagerRef;
  }

  public getCurrLocId(): LocationId {
    return this.getGameManager().currentLocationId;
  }

  public getLocationAtId(locationId: LocationId): GameLocation {
    return this.getGameManager().getStateManager().getGameMap().getLocationAtId(locationId);
  }

  public async changeLocationTo(locationName: string) {
    await this.getGameManager().changeLocationTo(locationName);
  }

  /////////////////////
  //    Game Mode    //
  /////////////////////

  public getLocationModes(locationId: LocationId): GameMode[] {
    return this.getGameManager().getStateManager().getLocationModes(locationId);
  }

  public addLocationMode(locationId: LocationId, mode: GameMode): void {
    this.getGameManager().getStateManager().addLocationMode(locationId, mode);
  }

  public removeLocationMode(locationId: LocationId, mode: GameMode): void {
    this.getGameManager().getStateManager().removeLocationMode(locationId, mode);
  }

  /////////////////////
  //   Interaction   //
  /////////////////////

  public hasTriggeredInteraction(id: string): boolean | undefined {
    return this.getGameManager().getStateManager().hasTriggeredInteraction(id);
  }

  public triggerAction(actionId: ItemId): void {
    this.getGameManager().getStateManager().triggerAction(actionId);
  }

  public triggerInteraction(id: string): void {
    this.getGameManager().getStateManager().triggerInteraction(id);
  }

  /////////////////////
  //    Game Items   //
  /////////////////////

  public watchGameItemType(gameItemType: GameItemType, stateObserver: StateObserver) {
    this.getGameManager().getStateManager().watchGameItemType(gameItemType, stateObserver);
  }

  public getGameMap() {
    return this.getGameManager().getStateManager().getGameMap();
  }

  public getLocationAttr(gameItemType: GameItemType, locationId: LocationId): ItemId[] {
    return this.getGameManager().getStateManager().getLocationAttr(gameItemType, locationId);
  }

  public addItem(gameItemType: GameItemType, locationId: LocationId, itemId: ItemId): void {
    this.getGameManager().getStateManager().addItem(gameItemType, locationId, itemId);
  }

  public removeItem(gameItemType: GameItemType, locationId: LocationId, itemId: ItemId): void {
    return this.getGameManager().getStateManager().removeItem(gameItemType, locationId, itemId);
  }

  /////////////////////
  //  Game Objects   //
  /////////////////////

  public makeObjectGlow(objectId: ItemId, turnOn: boolean) {
    this.getGameManager().getObjectManager().makeObjectGlow(objectId, turnOn);
  }

  public makeObjectBlink(objectId: ItemId, turnOn: boolean) {
    this.getGameManager().getObjectManager().makeObjectBlink(objectId, turnOn);
  }

  public setObjProperty(id: ItemId, newObjProp: ObjectProperty) {
    this.getGameManager().getStateManager().setObjProperty(id, newObjProp);
  }

  public enableObjectAction(callbacks: ActivateSpriteCallbacks) {
    this.getGameManager().getObjectManager().enableObjectAction(callbacks);
  }

  public disableObjectAction() {
    this.getGameManager().getObjectManager().disableObjectAction();
  }

  /////////////////////
  //    Game BBox    //
  /////////////////////

  public setBBoxProperty(id: ItemId, newBBoxProp: BBoxProperty) {
    this.getGameManager().getStateManager().setBBoxProperty(id, newBBoxProp);
  }

  public enableBBoxAction(callbacks: ActivateSpriteCallbacks) {
    this.getGameManager().getBBoxManager().enableBBoxAction(callbacks);
  }

  public disableBBoxAction() {
    this.getGameManager().getBBoxManager().disableBBoxAction();
  }

  /////////////////////
  //  Game Objective //
  /////////////////////

  public isAllComplete(): boolean {
    return this.getGameManager().getStateManager().isAllComplete();
  }

  public isObjectiveComplete(key: string): boolean {
    return this.getGameManager().getStateManager().isObjectiveComplete(key);
  }

  public areObjectivesComplete(keys: string[]): boolean {
    return this.getGameManager().getStateManager().areObjectivesComplete(keys);
  }

  public completeObjective(key: string): void {
    this.getGameManager().getStateManager().completeObjective(key);
  }

  /////////////////////
  //   User State    //
  /////////////////////

  public addCollectible(id: string): void {
    SourceAcademyGame.getInstance().getUserStateManager().addCollectible(id);
  }

  public hasCollectible(id: string): boolean {
    return SourceAcademyGame.getInstance().getUserStateManager().hasCollectible(id);
  }

  public isAssessmentComplete(id: string): boolean {
    return SourceAcademyGame.getInstance().getUserStateManager().isAssessmentComplete(id);
  }

  public isAchievementUnlocked(id: string): boolean {
    return SourceAcademyGame.getInstance().getUserStateManager().isAchievementUnlocked(id);
  }

  /////////////////////
  //   Game Layer    //
  /////////////////////

  public clearSeveralLayers(layerTypes: Layer[]) {
    this.getGameManager().layerManager.clearSeveralLayers(layerTypes);
  }

  public addContainerToLayer(layer: Layer, gameObj: Phaser.GameObjects.GameObject) {
    this.getGameManager().layerManager.addToLayer(layer, gameObj);
  }

  public showLayer(layer: Layer) {
    this.getGameManager().layerManager.showLayer(layer);
  }

  public hideLayer(layer: Layer) {
    this.getGameManager().layerManager.hideLayer(layer);
  }

  public async fadeInLayer(layer: Layer, fadeDuration?: number) {
    await this.getGameManager().layerManager.fadeInLayer(layer, fadeDuration);
  }

  public async fadeOutLayer(layer: Layer, fadeDuration?: number) {
    await this.getGameManager().layerManager.fadeOutLayer(layer, fadeDuration);
  }
  /////////////////////
  //  Location Notif //
  /////////////////////

  public async bringUpUpdateNotif(message: string) {
    this.getGameManager();
    await displayNotification(message);
  }

  /////////////////////
  //   Story Action  //
  /////////////////////

  public async processGameActions(actionIds: ItemId[] | undefined) {
    await this.getGameManager().phaseManager.pushPhase(GamePhaseType.Sequence);
    await this.getGameManager().getActionManager().processGameActions(actionIds);
    await this.getGameManager().phaseManager.popPhase();
  }

  public async processGameActionsInSamePhase(actionIds: ItemId[] | undefined) {
    await this.getGameManager().getActionManager().processGameActions(actionIds);
  }

  /////////////////////
  //   Dialogue      //
  /////////////////////

  public async showDialogue(dialogueId: ItemId) {
    await this.getGameManager().phaseManager.pushPhase(GamePhaseType.Sequence);
    await this.getGameManager().getDialogueManager().showDialogue(dialogueId);
    await this.getGameManager().phaseManager.popPhase();
  }

  public async showDialogueInSamePhase(dialogueId: ItemId) {
    await this.getGameManager().getDialogueManager().showDialogue(dialogueId);
  }

  /////////////////////
  //   Collectible   //
  /////////////////////

  public async obtainCollectible(collectibleId: string) {
    SourceAcademyGame.getInstance().getUserStateManager().addCollectible(collectibleId);
  }

  /////////////////////
  //     Pop Up      //
  /////////////////////

  public displayPopUp(itemId: ItemId, position: GamePosition, duration?: number) {
    this.getGameManager().popUpManager.displayPopUp(itemId, position, duration);
  }

  public destroyAllPopUps() {
    this.getGameManager().popUpManager.destroyAllPopUps();
  }

  public async destroyPopUp(position: GamePosition) {
    this.getGameManager().popUpManager.destroyPopUp(position);
  }

  /////////////////////
  //    Save Game    //
  /////////////////////

  public async saveGame() {
    await this.getGameManager().getSaveManager().saveGame();
  }

  public async saveSettings(settingsJson: SettingsJson) {
    await this.getGameManager().getSaveManager().saveSettings(settingsJson);
  }

  public getLoadedUserState() {
    return this.getGameManager().getSaveManager().getLoadedUserState();
  }

  /////////////////////
  //      Sound      //
  /////////////////////

  public getSoundManager() {
    return SourceAcademyGame.getInstance().getSoundManager();
  }

  public playSound(soundKey: AssetKey) {
    SourceAcademyGame.getInstance().getSoundManager().playSound(soundKey);
  }

  public playBgMusic(soundKey: AssetKey) {
    SourceAcademyGame.getInstance().getSoundManager().playBgMusic(soundKey);
  }

  public async stopAllSound() {
    SourceAcademyGame.getInstance().getSoundManager().stopAllSound();
  }

  public pauseCurrBgMusic() {
    SourceAcademyGame.getInstance().getSoundManager().pauseCurrBgMusic();
  }

  public continueCurrBgMusic() {
    SourceAcademyGame.getInstance().getSoundManager().continueCurrBgMusic();
  }

  public applySoundSettings(userSettings: SettingsJson) {
    SourceAcademyGame.getInstance().getSoundManager().applyUserSettings(userSettings);
  }

  public loadSounds(soundAssets: SoundAsset[]) {
    SourceAcademyGame.getInstance().getSoundManager().loadSounds(soundAssets);
  }

  /////////////////////
  //      Input      //
  /////////////////////

  public enableKeyboardInput(active: boolean) {
    this.getGameManager().inputManager.enableKeyboardInput(active);
  }

  public enableMouseInput(active: boolean) {
    this.getGameManager().inputManager.enableMouseInput(active);
  }

  /////////////////////
  //      Phases     //
  /////////////////////

  public async popPhase() {
    await this.getGameManager().phaseManager.popPhase();
  }

  public async pushPhase(gamePhaseType: GamePhaseType) {
    await this.getGameManager().phaseManager.pushPhase(gamePhaseType);
  }

  public async swapPhase(gamePhaseType: GamePhaseType) {
    await this.getGameManager().phaseManager.swapPhase(gamePhaseType);
  }

  public isCurrentPhase(gamePhaseType: GamePhaseType) {
    return this.getGameManager().phaseManager.isCurrentPhase(gamePhaseType);
  }

  /////////////////////
  //   Background    //
  /////////////////////

  public renderBackgroundLayerContainer(locationId: LocationId) {
    this.getGameManager().backgroundManager.renderBackgroundLayerContainer(locationId);
  }

  /////////////////////
  //   Characters    //
  /////////////////////

  public createCharacterSprite(
    characterId: ItemId,
    overrideExpression?: string,
    overridePosition?: GamePosition
  ) {
    return this.getGameManager()
      .getCharacterManager()
      .createCharacterSprite(characterId, overrideExpression, overridePosition);
  }

  /////////////////////
  //  Item retrieval //
  /////////////////////

  public getDialogueById(dialogueId: ItemId): Dialogue {
    return mandatory(this.getGameMap().getDialogueMap().get(dialogueId));
  }

  public getCharacterById(characterId: ItemId): Character {
    return mandatory(this.getGameMap().getCharacterMap().get(characterId));
  }

  public getActionById(actionId: ItemId): GameAction {
    return mandatory(this.getGameMap().getActionMap().get(actionId));
  }

  public getObjectById(objectId: ItemId): ObjectProperty {
    return mandatory(this.getGameMap().getObjectPropMap().get(objectId));
  }

  public getBBoxById(bboxId: ItemId): BBoxProperty {
    return mandatory(this.getGameMap().getBBoxPropMap().get(bboxId));
  }
}

export default GameGlobalAPI;
