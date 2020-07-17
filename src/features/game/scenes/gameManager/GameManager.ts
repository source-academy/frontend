import GameActionManager from 'src/features/game/action/GameActionManager';
import GameBBoxManager from 'src/features/game/boundingBoxes/GameBoundingBoxManager';
import { GameCheckpoint } from 'src/features/game/chapter/GameChapterTypes';
import GameCharacterManager from 'src/features/game/character/GameCharacterManager';
import GameDialogueManager from 'src/features/game/dialogue/GameDialogueManager';
import { blackFade } from 'src/features/game/effects/FadeEffect';
import { addLoadingScreen } from 'src/features/game/effects/LoadingScreen';
import GameLayerManager from 'src/features/game/layer/GameLayerManager';
import { LocationId } from 'src/features/game/location/GameMapTypes';
import GameObjectManager from 'src/features/game/objects/GameObjectManager';
import GamePopUpManager from 'src/features/game/popUp/GamePopUpManager';
import GameStateManager from 'src/features/game/state/GameStateManager';
import GameUserStateManager from 'src/features/game/state/GameUserStateManager';
import SourceAcademyGame, {
  GameType
} from 'src/pages/academy/game/subcomponents/SourceAcademyGame';

import GameBackgroundManager from '../../background/GameBackgroundManager';
import GameCollectiblesManager from '../../collectibles/GameCollectiblesManager';
import { Constants } from '../../commons/CommonConstants';
import GameEscapeManager from '../../escape/GameEscapeManager';
import GameInputManager from '../../input/GameInputManager';
import { Layer } from '../../layer/GameLayerTypes';
import GamePhaseManager from '../../phase/GamePhaseManager';
import { GamePhaseType } from '../../phase/GamePhaseTypes';
import GameSaveManager, { SaveManagerProps } from '../../save/GameSaveManager';
import { mandatory, toS3Path } from '../../utils/GameUtils';
import GameGlobalAPI from './GameGlobalAPI';
import { createGamePhases } from './GameManagerHelper';

type GameManagerProps = SaveManagerProps & {
  gameCheckpoint: GameCheckpoint;
};

/**
 * Main scene that plays the checkpoint.
 *
 * It processes checkpoint objects and loads
 * the chapter exclusive assets (location image, sounds).
 *
 * It also handles main gameplay loop, e.g. switching between modes,
 * activation of escape or collectible menu, location switching,
 * triggering actions, etc.
 */
class GameManager extends Phaser.Scene {
  public currentLocationId: LocationId;
  private currentCheckpoint: GameCheckpoint | undefined;

  public layerManager: GameLayerManager;
  public stateManager: GameStateManager;
  public objectManager: GameObjectManager;
  public characterManager: GameCharacterManager;
  public dialogueManager: GameDialogueManager;
  public actionManager: GameActionManager;
  public userStateManager: GameUserStateManager;
  public boundingBoxManager: GameBBoxManager;
  public popUpManager: GamePopUpManager;
  public saveManager?: GameSaveManager;
  public escapeManager: GameEscapeManager;
  public phaseManager: GamePhaseManager;
  public backgroundManager: GameBackgroundManager;
  public inputManager: GameInputManager;
  public collectibleManager: GameCollectiblesManager;

  constructor() {
    super('GameManager');
    this.currentCheckpoint = undefined;
    this.currentLocationId = Constants.nullInteractionId;

    this.layerManager = new GameLayerManager();
    this.stateManager = new GameStateManager();
    this.characterManager = new GameCharacterManager();
    this.objectManager = new GameObjectManager();
    this.dialogueManager = new GameDialogueManager();
    this.actionManager = new GameActionManager();
    this.userStateManager = new GameUserStateManager();
    this.boundingBoxManager = new GameBBoxManager();
    this.popUpManager = new GamePopUpManager();
    this.escapeManager = new GameEscapeManager();
    this.phaseManager = new GamePhaseManager();
    this.backgroundManager = new GameBackgroundManager();
    this.inputManager = new GameInputManager();
    this.collectibleManager = new GameCollectiblesManager();
  }

  public init({
    gameCheckpoint,
    continueGame,
    chapterNum,
    checkpointNum,
    fullSaveState
  }: GameManagerProps) {
    SourceAcademyGame.getInstance().setCurrentSceneRef(this);
    this.currentCheckpoint = gameCheckpoint;
    this.saveManager = new GameSaveManager({
      continueGame,
      chapterNum,
      checkpointNum,
      fullSaveState
    });
    this.layerManager = new GameLayerManager();
    this.stateManager = new GameStateManager();
    this.characterManager = new GameCharacterManager();
    this.objectManager = new GameObjectManager();
    this.dialogueManager = new GameDialogueManager();
    this.actionManager = new GameActionManager();
    this.userStateManager = new GameUserStateManager();
    this.boundingBoxManager = new GameBBoxManager();
    this.popUpManager = new GamePopUpManager();
    this.escapeManager = new GameEscapeManager();
    this.phaseManager = new GamePhaseManager();
    this.backgroundManager = new GameBackgroundManager();
    this.inputManager = new GameInputManager();
    this.collectibleManager = new GameCollectiblesManager();
  }

  //////////////////////
  //    Preload       //
  //////////////////////

  public preload() {
    GameGlobalAPI.getInstance().setGameManager(this);
    addLoadingScreen(this);

    this.currentLocationId =
      this.getSaveManager().getLoadedLocation() || this.getCurrentCheckpoint().startingLoc;
    this.stateManager.initialise(this);
    this.userStateManager.initialise(this.getSaveManager().getLoadedUserState());
    this.dialogueManager.initialise(this);
    this.characterManager.initialise(this);
    this.actionManager.initialise(this);
    this.inputManager.initialise(this);
    this.boundingBoxManager.initialise();
    this.objectManager.initialise();
    this.layerManager.initialise(this);
    this.collectibleManager.initialise(this, this.userStateManager, this.phaseManager);
    this.phaseManager.initialise(
      createGamePhases(this.escapeManager, this.collectibleManager),
      this.inputManager
    );
    this.escapeManager.initialise(this, this.phaseManager, this.getSaveManager());

    GameGlobalAPI.getInstance().loadSounds(this.getCurrentCheckpoint().map.getSoundAssets());

    this.phaseManager.setCallback(
      async (newPhase: GamePhaseType) => await this.checkpointTransition(newPhase)
    );
    this.preloadLocationsAssets(this.getCurrentCheckpoint());
    this.bindKeyboardTriggers();
  }

  private preloadLocationsAssets(chapter: GameCheckpoint) {
    chapter.map.getMapAssets().forEach((assetPath, assetKey) => {
      this.load.image(assetKey, toS3Path(assetPath));
    });
  }

  //////////////////////
  // Location Helpers //
  //////////////////////

  public async create() {
    await this.userStateManager.loadAssessments();
    await this.userStateManager.loadAchievements();
    this.changeLocationTo(this.currentLocationId, true);
    await GameGlobalAPI.getInstance().saveGame();
  }

  private async renderLocation(locationId: LocationId, startAction: boolean) {
    const gameLocation = GameGlobalAPI.getInstance().getLocationAtId(locationId);
    await SourceAcademyGame.getInstance()
      .getSoundManager()
      .renderBackgroundMusic(gameLocation.bgmKey);

    this.backgroundManager.renderBackgroundLayerContainer(locationId);
    this.objectManager.renderObjectsLayerContainer(locationId);
    this.boundingBoxManager.renderBBoxLayerContainer(locationId);
    this.characterManager.renderCharacterLayerContainer(locationId);
    this.layerManager.showLayer(Layer.Character);

    await this.phaseManager.swapPhase(GamePhaseType.Sequence);

    // Execute start actions, notif, then cutscene
    if (startAction) {
      await this.actionManager.processGameActions(
        this.getCurrentCheckpoint().map.getStartActions()
      );
    }
    if (!this.stateManager.hasTriggeredInteraction(locationId)) {
      await GameGlobalAPI.getInstance().bringUpUpdateNotif(gameLocation.name);
    }
    await this.actionManager.processGameActions(gameLocation.actionIds);

    await this.phaseManager.swapPhase(GamePhaseType.Menu);
  }

  public async changeLocationTo(locationId: LocationId, startAction: boolean = false) {
    this.currentLocationId = locationId;

    await blackFade(this, 300, 500, async () => {
      await this.layerManager.clearAllLayers();
      await this.renderLocation(locationId, startAction);
    });

    // Update state after location is fully rendered
    this.stateManager.triggerInteraction(locationId);
  }

  private bindKeyboardTriggers() {
    this.inputManager.registerKeyboardListener(
      Phaser.Input.Keyboard.KeyCodes.ESC,
      'up',
      async () => {
        if (this.phaseManager.isCurrentPhase(GamePhaseType.EscapeMenu)) {
          await this.phaseManager.popPhase();
        } else {
          await this.phaseManager.pushPhase(GamePhaseType.EscapeMenu);
        }
      }
    );
    this.inputManager.registerKeyboardListener(Phaser.Input.Keyboard.KeyCodes.I, 'up', async () => {
      if (this.phaseManager.isCurrentPhase(GamePhaseType.CollectibleMenu)) {
        await this.phaseManager.popPhase();
      } else {
        await this.phaseManager.pushPhase(GamePhaseType.CollectibleMenu);
      }
    });
  }

  public cleanUp() {
    SourceAcademyGame.getInstance().getSoundManager().stopCurrBgMusic();
    this.inputManager.clearListeners();
    this.layerManager.clearAllLayers();
  }

  public async checkpointTransition(newPhase: GamePhaseType) {
    const transitionToNextCheckpoint =
      newPhase === GamePhaseType.Menu && GameGlobalAPI.getInstance().isAllComplete();

    // Transition to the next scene if possible
    if (transitionToNextCheckpoint) {
      await this.actionManager.processGameActions(this.getCurrentCheckpoint().map.getEndActions());
      this.cleanUp();
      if (SourceAcademyGame.getInstance().isGameType(GameType.Simulator)) {
        this.scene.start('StorySimulatorMenu');
      } else {
        this.scene.start('CheckpointTransition');
      }
    }
  }

  public getCurrentCheckpoint = () => mandatory(this.currentCheckpoint);
  public getSaveManager = () => mandatory(this.saveManager);
}

export default GameManager;
