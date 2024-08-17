import { GameAction } from '../../action/GameActionTypes';
import { SoundAsset } from '../../assets/AssetsTypes';
import { getAwardProp } from '../../awards/GameAwardsHelper';
import { BBoxProperty } from '../../boundingBoxes/GameBoundingBoxTypes';
import { Character, SpeakerDetail } from '../../character/GameCharacterTypes';
import { AssetKey, GamePosition, GameSize, ItemId } from '../../commons/CommonTypes';
import { Dialogue } from '../../dialogue/GameDialogueTypes';
import { displayMiniMessage } from '../../effects/MiniMessage';
import { displayNotification } from '../../effects/Notification';
import { promptWithChoices } from '../../effects/Prompt';
import { Layer } from '../../layer/GameLayerTypes';
import { AnyId, GameItemType, GameLocation, LocationId } from '../../location/GameMapTypes';
import { GameMode } from '../../mode/GameModeTypes';
import { ObjectProperty } from '../../objects/GameObjectTypes';
import { GamePhaseType } from '../../phase/GamePhaseTypes';
import { Quiz } from '../../quiz/GameQuizType';
import { SettingsJson } from '../../save/GameSaveTypes';
import SourceAcademyGame from '../../SourceAcademyGame';
import { StateObserver, UserStateType } from '../../state/GameStateTypes';
import { TaskDetail } from '../../task/GameTaskTypes';
import { courseId, mandatory } from '../../utils/GameUtils';
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

  public triggerStateChangeAction(actionId: ItemId): void {
    this.getGameManager().getStateManager().triggerStateChangeAction(actionId);
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

  public getGameItemsInLocation(gameItemType: GameItemType, locationId: LocationId): ItemId[] {
    return this.getGameManager().getStateManager().getGameItemsInLocation(gameItemType, locationId);
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

  public renderObjectLayerContainer(locationId: LocationId) {
    this.getGameManager().getObjectManager().renderObjectsLayerContainer(locationId);
  }

  public getAllActivatables() {
    return [
      ...this.getGameManager().getObjectManager().getActivatables(),
      ...this.getGameManager().getBBoxManager().getActivatables()
    ];
  }

  /////////////////////
  //    Game BBox    //
  /////////////////////

  public setBBoxProperty(id: ItemId, newBBoxProp: BBoxProperty) {
    this.getGameManager().getStateManager().setBBoxProperty(id, newBBoxProp);
  }

  public renderBBoxLayerContainer(locationId: LocationId) {
    this.getGameManager().getBBoxManager().renderBBoxLayerContainer(locationId);
  }

  /////////////////////
  //  Game Objective //
  /////////////////////

  public areAllObjectivesComplete(): boolean {
    return this.getGameManager().getStateManager().areAllObjectivesComplete();
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
  //  Game Task      //
  /////////////////////

  public isTaskComplete(key: string): boolean {
    return this.getGameManager().getStateManager().isTaskComplete(key);
  }

  public areTasksComplete(keys: string[]): boolean {
    return this.getGameManager().getStateManager().areTasksComplete(keys);
  }

  public completeTask(key: string): void {
    this.getGameManager().getStateManager().completeTask(key);
    displayMiniMessage(this.getGameManager(), 'Task completed!');
  }

  public showTask(key: string): void {
    this.getGameManager().getStateManager().showTask(key);
    displayMiniMessage(this.getGameManager(), 'New task added');
  }

  public getAllVisibleTaskData(): Array<[TaskDetail, boolean]> {
    return this.getGameManager().getStateManager().getAllVisibleTaskData();
  }

  /////////////////////
  //   User State    //
  /////////////////////

  public addCollectible(id: string): void {
    SourceAcademyGame.getInstance().getUserStateManager().addCollectible(id);
  }

  public async isInUserState(userStateType: UserStateType, id: string): Promise<boolean> {
    return SourceAcademyGame.getInstance().getUserStateManager().isInUserState(userStateType, id);
  }

  /////////////////////
  //   Game Layer    //
  /////////////////////

  public clearSeveralLayers(layerTypes: Layer[]) {
    this.getGameManager().getLayerManager().clearSeveralLayers(layerTypes);
  }

  public addToLayer(layer: Layer, gameObj: Phaser.GameObjects.GameObject) {
    this.getGameManager().getLayerManager().addToLayer(layer, gameObj);
  }

  public showLayer(layer: Layer) {
    this.getGameManager().getLayerManager().showLayer(layer);
  }

  public hideLayer(layer: Layer) {
    this.getGameManager().getLayerManager().hideLayer(layer);
  }

  public async fadeInLayer(layer: Layer, fadeDuration?: number) {
    await this.getGameManager().getLayerManager().fadeInLayer(layer, fadeDuration);
  }

  public async fadeOutLayer(layer: Layer, fadeDuration?: number) {
    await this.getGameManager().getLayerManager().fadeOutLayer(layer, fadeDuration);
  }
  /////////////////////
  //  Location Notif //
  /////////////////////

  public async bringUpUpdateNotif(message: string) {
    await displayNotification(this.getGameManager(), message);
  }

  /////////////////////
  //   Story Action  //
  /////////////////////

  public async processGameActions(actionIds: ItemId[] | undefined) {
    await this.getGameManager().getPhaseManager().pushPhase(GamePhaseType.Sequence);
    await this.getGameManager().getActionManager().processGameActions(actionIds);
    await this.getGameManager().getPhaseManager().popPhase();
  }

  public async processGameActionsInSamePhase(actionIds: ItemId[] | undefined) {
    await this.getGameManager().getActionManager().processGameActions(actionIds);
  }

  /////////////////////
  //   Dialogue      //
  /////////////////////

  public async showDialogue(dialogueId: ItemId) {
    await this.getGameManager().getPhaseManager().pushPhase(GamePhaseType.Sequence);
    await this.getGameManager().getDialogueManager().showDialogue(dialogueId);
    await this.getGameManager().getPhaseManager().popPhase();
  }

  public async showDialogueInSamePhase(dialogueId: ItemId) {
    await this.getGameManager().getDialogueManager().showDialogue(dialogueId);
  }

  public async showNextLine(resolve: () => void) {
    await this.getGameManager().getDialogueManager().showNextLine(resolve);
  }

  /////////////////////
  //   Storage      //
  /////////////////////

  public storeDialogueLine(newLine: string, newSpeakerDetail?: SpeakerDetail | null) {
    this.getGameManager().getDialogueStorageManager().storeLine(newLine, newSpeakerDetail);
  }

  public getDialogueStorage() {
    return this.getGameManager().getDialogueStorageManager().getDialogueStorage();
  }

  /////////////////////
  //   Collectible   //
  /////////////////////

  public async obtainCollectible(collectibleId: string) {
    displayMiniMessage(this.getGameManager(), `Obtained ${getAwardProp(collectibleId).title}`);
    SourceAcademyGame.getInstance().getUserStateManager().addCollectible(collectibleId);
  }

  /////////////////////
  //     Pop Up      //
  /////////////////////

  public displayPopUp(itemId: ItemId, position: GamePosition, duration?: number, size?: GameSize) {
    this.getGameManager().getPopupManager().displayPopUp(itemId, position, duration, size);
  }

  public destroyAllPopUps() {
    this.getGameManager().getPopupManager().destroyAllPopUps();
  }

  public async destroyPopUp(position: GamePosition) {
    this.getGameManager().getPopupManager().destroyPopUp(position);
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
  //    Animations   //
  /////////////////////

  public startAnimation(id: AnyId, startFrame: number, frameRate: number) {
    const startImage = this.getAssetByKey(this.getGameMap().getAssetKeyFromId(id));
    this.getGameManager().getAnimationManager().displayAnimation(startImage, startFrame, frameRate);
  }

  public stopAnimation(id: AnyId) {
    const stopImage = this.getAssetByKey(this.getGameMap().getAssetKeyFromId(id));
    this.getGameManager().getAnimationManager().stopAnimation(stopImage);
  }

  /////////////////////
  //      Input      //
  /////////////////////

  public setDefaultCursor(cursor: string) {
    this.getGameManager().getInputManager().setDefaultCursor(cursor);
  }

  public enableKeyboardInput(active: boolean) {
    this.getGameManager().getInputManager().enableKeyboardInput(active);
  }

  public enableMouseInput(active: boolean) {
    this.getGameManager().getInputManager().enableMouseInput(active);
  }

  public enableSprite(gameObject: Phaser.GameObjects.GameObject, active: boolean) {
    if (active) {
      this.getGameManager().input.enable(gameObject);
    } else {
      this.getGameManager().input.disable(gameObject);
    }
  }

  /////////////////////
  //      Phases     //
  /////////////////////

  public async popPhase() {
    await this.getGameManager().getPhaseManager().popPhase();
  }

  public async pushPhase(gamePhaseType: GamePhaseType) {
    await this.getGameManager().getPhaseManager().pushPhase(gamePhaseType);
  }

  public async swapPhase(gamePhaseType: GamePhaseType) {
    await this.getGameManager().getPhaseManager().swapPhase(gamePhaseType);
  }

  public isCurrentPhase(gamePhaseType: GamePhaseType) {
    return this.getGameManager().getPhaseManager().isCurrentPhase(gamePhaseType);
  }

  /////////////////////
  //   Background    //
  /////////////////////

  public renderBackgroundLayerContainer(locationId: LocationId) {
    this.getGameManager().getBackgroundManager().renderBackgroundLayerContainer(locationId);
  }

  /////////////////////
  //    Assessment   //
  /////////////////////

  public async promptNavigateToAssessment(assessmentId: number) {
    const response = await promptWithChoices(
      GameGlobalAPI.getInstance().getGameManager(),
      `Are you ready for the challenge?`,
      ['Yes', 'No']
    );
    if (response === 0) {
      window.open(`/courses/${courseId()}/missions/${assessmentId}/0`, 'blank');
      window.focus();
    }
  }

  public async updateAssessmentState() {
    await SourceAcademyGame.getInstance().getUserStateManager().loadAssessments();
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

  public moveCharacter(id: ItemId, newLocation: LocationId, newPosition: GamePosition) {
    this.getGameManager().getStateManager().moveCharacter(id, newLocation, newPosition);
  }

  public updateCharacter(id: ItemId, expression: string) {
    this.getGameManager().getStateManager().updateCharacter(id, expression);
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

  public getQuizById(quizId: ItemId): Quiz {
    return mandatory(this.getGameMap().getQuizMap().get(quizId));
  }

  public getAssetByKey(assetKey: AssetKey) {
    return this.getGameMap().getAssetByKey(assetKey);
  }

  /////////////////////
  //      Quiz       //
  /////////////////////

  public async showQuiz(quizId: ItemId) {
    await this.getGameManager().getQuizManager().showQuiz(quizId);
  }

  public getQuizLength(quizId: ItemId): number {
    return this.getGameManager().getQuizManager().getNumOfQns(quizId);
  }

  public isQuizAttempted(key: string): boolean {
    return this.getGameManager().getStateManager().isQuizAttempted(key);
  }

  public isQuizComplete(key: string): boolean {
    return this.getGameManager().getStateManager().isQuizComplete(key);
  }

  public setQuizScore(key: string, score: number): void {
    this.getGameManager().getStateManager().setQuizScore(key, score);
  }

  public getQuizScore(key: string): number {
    return this.getGameManager().getStateManager().getQuizScore(key);
  }
}

export default GameGlobalAPI;
