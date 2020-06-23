import GameActionManager from '../../action/GameActionManager';
import GameLayerManager from 'src/features/game/layer/GameLayerManager';
import GameCharacterManager from 'src/features/game/character/GameCharacterManager';
import GameDialogueManager from 'src/features/game/dialogue/GameDialogueManager';
import GameStateManager from 'src/features/game/state/GameStateManager';
import GameObjectManager from 'src/features/game/objects/GameObjectManager';
import GameActionExecuter from 'src/features/game/action/GameActionExecuter';
import GameUserStateManager from 'src/features/game/state/GameUserStateManager';
import GameEscapeManager from '../../escape/GameEscapeManager';
import GamePhaseManager from '../../phase/GamePhaseManager';
import GameBBoxManager from 'src/features/game/boundingBoxes/GameBoundingBoxManager';
import GamePopUpManager from 'src/features/game/popUp/GamePopUpManager';
import GameSoundManager from '../../sound/GameSoundManager';
import GameSaveManager from '../../save/GameSaveManager';
import GameBackgroundManager from '../../background/GameBackgroundManager';

import LocationSelectChapter from '../LocationSelectChapter';
import commonAssets from 'src/features/game/commons/CommonAssets';
import { GameCheckpoint } from 'src/features/game/chapter/GameChapterTypes';
import { LocationId } from 'src/features/game/location/GameMapTypes';
import { blackFade } from 'src/features/game/effects/FadeEffect';
import { addLoadingScreen } from 'src/features/game/effects/LoadingScreen';
import phaserGame from 'src/pages/academy/game/subcomponents/phaserGame';
import { GamePhaseType } from '../../phase/GamePhaseTypes';
import { FullSaveState } from '../../save/GameSaveTypes';

type GameManagerProps = {
  fullSaveState: FullSaveState;
  gameCheckpoint: GameCheckpoint;
  continueGame: boolean;
  chapterNum: number;
  checkpointNum: number;
};

class GameManager extends Phaser.Scene {
  public currentCheckpoint: GameCheckpoint;
  public currentLocationId: LocationId;

  private fullSaveState: FullSaveState | undefined;
  private continueGame: boolean;
  private chapterNum: number;
  private checkpointNum: number;

  public layerManager: GameLayerManager;
  public stateManager: GameStateManager;
  public objectManager: GameObjectManager;
  public characterManager: GameCharacterManager;
  public dialogueManager: GameDialogueManager;
  public actionExecuter: GameActionExecuter;
  public userStateManager: GameUserStateManager;
  public boundingBoxManager: GameBBoxManager;
  public popUpManager: GamePopUpManager;
  public saveManager: GameSaveManager;
  public soundManager: GameSoundManager;
  public escapeManager: GameEscapeManager;
  public phaseManager: GamePhaseManager;
  public backgroundManager: GameBackgroundManager;

  constructor() {
    super('GameManager');
    this.currentCheckpoint = LocationSelectChapter;
    this.fullSaveState = undefined;
    this.continueGame = false;
    this.chapterNum = -1;
    this.checkpointNum = -1;
    this.currentLocationId = this.currentCheckpoint.startingLoc;

    this.layerManager = new GameLayerManager();
    this.stateManager = new GameStateManager();
    this.characterManager = new GameCharacterManager();
    this.objectManager = new GameObjectManager();
    this.dialogueManager = new GameDialogueManager();
    this.actionExecuter = new GameActionExecuter();
    this.userStateManager = new GameUserStateManager();
    this.boundingBoxManager = new GameBBoxManager();
    this.popUpManager = new GamePopUpManager();
    this.saveManager = new GameSaveManager();
    this.soundManager = new GameSoundManager();
    this.escapeManager = new GameEscapeManager();
    this.phaseManager = new GamePhaseManager();
    this.backgroundManager = new GameBackgroundManager();
  }

  public init({
    gameCheckpoint,
    fullSaveState,
    continueGame,
    chapterNum,
    checkpointNum
  }: GameManagerProps) {
    this.currentCheckpoint = gameCheckpoint;
    this.fullSaveState = fullSaveState;
    this.continueGame = continueGame;
    this.chapterNum = chapterNum;
    this.checkpointNum = checkpointNum;
    this.initialiseManagers();
  }

  private initialiseManagers() {
    this.layerManager = new GameLayerManager();
    this.stateManager = new GameStateManager();
    this.characterManager = new GameCharacterManager();
    this.objectManager = new GameObjectManager();
    this.dialogueManager = new GameDialogueManager();
    this.actionExecuter = new GameActionExecuter();
    this.userStateManager = new GameUserStateManager();
    this.boundingBoxManager = new GameBBoxManager();
    this.popUpManager = new GamePopUpManager();
    this.saveManager = new GameSaveManager();
    this.escapeManager = new GameEscapeManager();
    this.phaseManager = new GamePhaseManager();
    this.backgroundManager = new GameBackgroundManager();
  }

  public loadGameState() {
    const accountInfo = phaserGame.getAccountInfo();
    this.saveManager.initialise(
      accountInfo,
      this.fullSaveState,
      this.chapterNum,
      this.checkpointNum
    );
    this.userStateManager.initialise(this.saveManager.getLoadedUserState());
    const startingGameState =
      this.continueGame && accountInfo ? this.saveManager.getLoadedGameStoryState() : undefined;
    this.stateManager.initialise(this.currentCheckpoint, startingGameState);
    if (this.continueGame) {
      this.currentLocationId = this.saveManager.getLoadedLocation();
    }
  }

  //////////////////////
  //    Preload       //
  //////////////////////

  public preload() {
    GameActionManager.getInstance().setGameManager(this);

    this.currentLocationId = this.currentCheckpoint.startingLoc;

    this.loadGameState();

    this.soundManager.initialise(this);
    this.dialogueManager.initialise(this.currentCheckpoint.map.getDialogues());
    this.characterManager.initialise(this.currentCheckpoint.map.getCharacters());
    this.actionExecuter.initialise(this.currentCheckpoint.map.getActions());
    this.boundingBoxManager.initialise();
    this.objectManager.initialise();
    this.layerManager.initialiseMainLayer(this);
    this.soundManager.loadSounds(this.currentCheckpoint.map.getSoundAssets());
    this.bindEscapeMenu();

    addLoadingScreen(this);
    this.preloadLocationsAssets(this.currentCheckpoint);
    this.preloadBaseAssets();
  }

  private preloadBaseAssets() {
    commonAssets.forEach(asset => {
      this.load.image(asset.key, asset.path);
    });
  }

  private preloadLocationsAssets(chapter: GameCheckpoint) {
    chapter.map.getMapAssets().forEach((assetPath, assetKey) => {
      this.load.image(assetKey, assetPath);
    });
  }

  //////////////////////
  // Location Helpers //
  //////////////////////

  public async create() {
    this.changeLocationTo(this.currentLocationId);
    await GameActionManager.getInstance().saveGame();
  }

  private async renderLocation(locationId: LocationId) {
    this.soundManager.renderBackgroundMusic(locationId);
    this.backgroundManager.renderBackgroundLayerContainer(locationId);
    this.objectManager.renderObjectsLayerContainer(locationId);
    this.boundingBoxManager.renderBBoxLayerContainer(locationId);
    this.characterManager.renderCharacterLayerContainer(locationId);

    const gameLocation = this.currentCheckpoint.map.getLocationAtId(locationId);
    await this.phaseManager.swapPhase(GamePhaseType.Sequence);
    // Notify players that location is not yet visited/has new update
    if (!this.stateManager.hasTriggeredInteraction(locationId)) {
      await GameActionManager.getInstance().bringUpUpdateNotif(gameLocation.name);
    }
    await this.actionExecuter.executeStoryActions(gameLocation.actionIds);
    await this.phaseManager.swapPhase(GamePhaseType.Menu);
  }

  public async changeLocationTo(locationId: LocationId) {
    this.currentLocationId = locationId;

    await blackFade(this, 300, 300, () => {
      this.layerManager.clearAllLayers();
      this.renderLocation(locationId);
    });

    // Update state after location is fully rendered
    this.stateManager.triggerInteraction(locationId);
  }

  private bindEscapeMenu() {
    const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey.on('up', () => {
      if (this.phaseManager.isCurrentPhase(GamePhaseType.EscapeMenu)) {
        this.phaseManager.popPhase();
      } else {
        this.phaseManager.pushPhase(GamePhaseType.EscapeMenu);
      }
    });
  }
}

export default GameManager;
