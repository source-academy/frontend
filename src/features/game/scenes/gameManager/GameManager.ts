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
import GameCollectibleRenderer from '../../collectibles/CollectiblesRenderer';

import LocationSelectChapter from '../LocationSelectChapter';
import { GameCheckpoint } from 'src/features/game/chapter/GameChapterTypes';
import { LocationId } from 'src/features/game/location/GameMapTypes';
import { blackFade } from 'src/features/game/effects/FadeEffect';
import { addLoadingScreen } from 'src/features/game/effects/LoadingScreen';
import {
  getSourceAcademyGame,
  SourceAcademyGame,
  AccountInfo
} from 'src/pages/academy/game/subcomponents/sourceAcademyGame';
import { GamePhaseType } from '../../phase/GamePhaseTypes';
import { FullSaveState } from '../../save/GameSaveTypes';
import { getStorySimulatorGame } from 'src/pages/academy/storySimulator/subcomponents/storySimulatorGame';
import { Layer } from '../../layer/GameLayerTypes';
import commonAssets from '../../commons/CommonAssets';

type GameManagerProps = {
  fullSaveState: FullSaveState;
  gameCheckpoint: GameCheckpoint;
  continueGame: boolean;
  chapterNum: number;
  checkpointNum: number;
  isStorySimulator: boolean;
};

class GameManager extends Phaser.Scene {
  public currentCheckpoint: GameCheckpoint;
  public currentLocationId: LocationId;
  public parentGame: SourceAcademyGame | undefined;
  public isStorySimulator: boolean;

  private accountInfo: AccountInfo | undefined;
  private fullSaveState: FullSaveState | undefined;
  private continueGame: boolean;
  private chapterNum: number;
  private checkpointNum: number;
  private escKey: Phaser.Input.Keyboard.Key | undefined;

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
  public collectibleRenderer: GameCollectibleRenderer;

  constructor() {
    super('GameManager');
    this.currentCheckpoint = LocationSelectChapter;
    this.fullSaveState = undefined;
    this.continueGame = false;
    this.chapterNum = -1;
    this.checkpointNum = -1;
    this.currentLocationId = this.currentCheckpoint.startingLoc;
    this.isStorySimulator = false;

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
    this.collectibleRenderer = new GameCollectibleRenderer();
  }

  public init({
    gameCheckpoint,
    fullSaveState,
    continueGame,
    chapterNum,
    checkpointNum,
    isStorySimulator
  }: GameManagerProps) {
    this.isStorySimulator = isStorySimulator;
    this.parentGame = isStorySimulator ? getStorySimulatorGame() : getSourceAcademyGame();
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
    this.collectibleRenderer = new GameCollectibleRenderer();
  }

  //////////////////////
  //    Preload       //
  //////////////////////

  public preload() {
    GameActionManager.getInstance().setGameManager(this);
    this.loadGameState();

    this.currentLocationId =
      this.saveManager.getLoadedLocation() || this.currentCheckpoint.startingLoc;
    this.stateManager.initialise(this);
    this.userStateManager.initialise(this);
    this.soundManager.initialise(this, this.parentGame || getSourceAcademyGame());
    this.dialogueManager.initialise(this);
    this.characterManager.initialise(this);
    this.actionExecuter.initialise(this);
    this.boundingBoxManager.initialise();
    this.objectManager.initialise();
    this.layerManager.initialiseMainLayer(this);
    this.collectibleRenderer.initialise(this);
    this.soundManager.loadSounds(this.currentCheckpoint.map.getSoundAssets());
    this.bindEscapeMenu();

    addLoadingScreen(this);
    this.preloadBaseAssets();
    this.preloadLocationsAssets(this.currentCheckpoint);
  }

  private loadGameState() {
    this.accountInfo = this.getParentGame().getAccountInfo();
    if (this.isStorySimulator && this.accountInfo.role === 'staff') {
      this.saveManager.initialiseForStaff(this.accountInfo);
    } else if (!this.isStorySimulator && this.accountInfo.role === 'student') {
      this.saveManager.initialiseForGame(
        this.accountInfo,
        this.fullSaveState,
        this.chapterNum,
        this.checkpointNum,
        this.continueGame
      );
    } else {
      throw new Error('Mismatch of roles');
    }
  }

  private preloadBaseAssets() {
    commonAssets.forEach(({ key, path }) => {
      this.load.image(key, path);
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
    this.collectibleRenderer.renderCollectiblesLayerContainer(locationId);
    this.characterManager.renderCharacterLayerContainer(locationId);
    this.layerManager.showLayer(Layer.Character);

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

    await blackFade(this, 300, 500, async () => {
      await this.layerManager.clearAllLayers();
      await this.renderLocation(locationId);
    });

    // Update state after location is fully rendered
    this.stateManager.triggerInteraction(locationId);
  }

  private bindEscapeMenu() {
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.escKey.addListener('up', async () => {
      if (this.phaseManager.isCurrentPhase(GamePhaseType.EscapeMenu)) {
        await this.phaseManager.popPhase();
      } else {
        await this.phaseManager.pushPhase(GamePhaseType.EscapeMenu);
      }
    });
  }

  public cleanUp() {
    if (this.escKey) {
      this.escKey.removeAllListeners();
    }
    this.layerManager.clearAllLayers();
  }

  public async checkpointTransition() {
    if (GameActionManager.getInstance().isAllComplete()) {
      this.cleanUp();
      if (GameActionManager.getInstance().getGameManager().isStorySimulator) {
        this.scene.start('StorySimulatorMenu');
      } else {
        this.scene.start('CheckpointTransition');
      }
    }
  }

  private getParentGame() {
    if (!this.parentGame) {
      throw new Error('No parent game');
    }
    return this.parentGame;
  }

  public getAccountInfo() {
    if (!this.accountInfo) {
      throw new Error('No account info');
    }
    return this.accountInfo;
  }
}

export default GameManager;
