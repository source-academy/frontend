import GameActionManager from '../../action/GameActionManager';
import GameAnimationManager from '../../animations/GameAnimationManager';
import { AssetType, ImageAsset } from '../../assets/AssetsTypes';
import GameAwardsManager from '../../awards/GameAwardsManager';
import GameBackgroundManager from '../../background/GameBackgroundManager';
import GameBBoxManager from '../../boundingBoxes/GameBoundingBoxManager';
import { GameCheckpoint } from '../../chapter/GameChapterTypes';
import GameCharacterManager from '../../character/GameCharacterManager';
import { Constants } from '../../commons/CommonConstants';
import { AssetKey } from '../../commons/CommonTypes';
import GameDashboardManager from '../../dashboard/GameDashboardManager';
import { DashboardPage } from '../../dashboard/GameDashboardTypes';
import GameDialogueManager from '../../dialogue/GameDialogueManager';
import GameDialogueStorageManager from '../../dialogue/GameDialogueStorageManager';
import { blackFade, blackScreen, fadeIn } from '../../effects/FadeEffect';
import { addLoadingScreen } from '../../effects/LoadingScreen';
import GameEscapeManager from '../../escape/GameEscapeManager';
import { keyboardShortcuts } from '../../input/GameInputConstants';
import GameInputManager from '../../input/GameInputManager';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import { LocationId } from '../../location/GameMapTypes';
import { GameItemType } from '../../location/GameMapTypes';
import GameLogManager from '../../log/GameLogManager';
import { GameMode } from '../../mode/GameModeTypes';
import GameObjectManager from '../../objects/GameObjectManager';
import GamePhaseManager from '../../phase/GamePhaseManager';
import { GamePhaseType } from '../../phase/GamePhaseTypes';
import GamePopUpManager from '../../popUp/GamePopUpManager';
import GameQuizManager from '../../quiz/GameQuizManager';
import SourceAcademyGame from '../../SourceAcademyGame';
import GameStateManager from '../../state/GameStateManager';
import GameTaskLogManager from '../../task/GameTaskLogManager';
import GameToolbarManager from '../../toolbar/GameToolbarManager';
import { mandatory, sleep, toS3Path } from '../../utils/GameUtils';
import GameGlobalAPI from './GameGlobalAPI';
import { createGamePhases } from './GameManagerHelper';

type GameManagerProps = {
  continueGame: boolean;
  chapterNum: number;
  checkpointNum: number;
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
  public hasTransitioned: boolean;
  private stateManager?: GameStateManager;
  private layerManager?: GameLayerManager;
  private objectManager?: GameObjectManager;
  private characterManager?: GameCharacterManager;
  private dialogueManager?: GameDialogueManager;
  private actionManager?: GameActionManager;
  private boundingBoxManager?: GameBBoxManager;
  private popUpManager?: GamePopUpManager;
  private phaseManager?: GamePhaseManager;
  private backgroundManager?: GameBackgroundManager;
  private animationManager?: GameAnimationManager;
  private inputManager?: GameInputManager;
  private escapeManager?: GameEscapeManager;
  private collectibleManager?: GameAwardsManager;
  private achievementManager?: GameAwardsManager;
  private logManager?: GameLogManager;
  private dialogueStorageManager?: GameDialogueStorageManager;
  private toolbarManager?: GameToolbarManager;
  private taskLogManager?: GameTaskLogManager;
  private dashboardManager?: GameDashboardManager;
  private quizManager?: GameQuizManager;

  constructor() {
    super('GameManager');
    this.currentLocationId = Constants.nullInteractionId;
    this.hasTransitioned = false;
  }

  public init({ gameCheckpoint, continueGame, chapterNum, checkpointNum }: GameManagerProps) {
    GameGlobalAPI.getInstance().setGameManager(this);
    SourceAcademyGame.getInstance().setCurrentSceneRef(this);
    this.getSaveManager().registerGameInfo(chapterNum, checkpointNum, continueGame);
    this.currentLocationId =
      this.getSaveManager().getLoadedLocation() || gameCheckpoint.startingLoc;
    this.hasTransitioned = false;

    this.stateManager = new GameStateManager(gameCheckpoint);
    this.layerManager = new GameLayerManager(this);
    this.inputManager = new GameInputManager(this);
    this.phaseManager = new GamePhaseManager(createGamePhases(), this.inputManager);
    this.characterManager = new GameCharacterManager();
    this.objectManager = new GameObjectManager();
    this.dialogueManager = new GameDialogueManager();
    this.actionManager = new GameActionManager();
    this.boundingBoxManager = new GameBBoxManager();
    this.backgroundManager = new GameBackgroundManager();
    this.animationManager = new GameAnimationManager();
    this.popUpManager = new GamePopUpManager();
    this.escapeManager = new GameEscapeManager(this);
    this.collectibleManager = new GameAwardsManager(
      this,
      SourceAcademyGame.getInstance().getUserStateManager().getCollectibles
    );
    this.achievementManager = new GameAwardsManager(
      this,
      SourceAcademyGame.getInstance().getUserStateManager().getAchievements
    );
    this.logManager = new GameLogManager(this);
    this.dialogueStorageManager = new GameDialogueStorageManager();
    this.toolbarManager = new GameToolbarManager(this);
    this.taskLogManager = new GameTaskLogManager(this);
    this.dashboardManager = new GameDashboardManager(
      this,
      [
        DashboardPage.Log,
        DashboardPage.Tasks,
        DashboardPage.Collectibles,
        DashboardPage.Achievements
      ],
      [this.logManager, this.taskLogManager, this.collectibleManager, this.achievementManager]
    );
    this.quizManager = new GameQuizManager();
  }

  //////////////////////
  //    Preload       //
  //////////////////////

  public preload() {
    addLoadingScreen(this);
    this.getPhaseManager().setInterruptCheckCallback(
      (prevPhase: GamePhaseType, newPhase: GamePhaseType) =>
        this.transitionChecker(prevPhase, newPhase)
    );
    this.getPhaseManager().setInterruptCallback(
      async (prevPhase: GamePhaseType, newPhase: GamePhaseType) => await this.checkpointTransition()
    );
    this.getPhaseManager().setCallback(
      async (prevPhase: GamePhaseType, newPhase: GamePhaseType) =>
        await this.handleCharacterLayer(prevPhase, newPhase)
    );
    this.preloadLocationsAssets();
    this.bindKeyboardTriggers();
  }

  /**
   * Preload all assets (image and sounds) exclusive to the checkpoint's gamemap.
   */
  private preloadLocationsAssets() {
    const gameMap = this.getStateManager().getGameMap();
    GameGlobalAPI.getInstance().loadSounds(gameMap.getSoundAssets());
    gameMap.getMapAssets().forEach((image, assetKey) => {
      this.loadImage(image, assetKey);
    });
  }

  /**
   * Loads each asset type (image, sprite) appropriately
   *
   * @param image ImageAsset object to be loaded
   * @param assetKey asset key of ImageAsset
   */
  private loadImage(image: ImageAsset, assetKey: AssetKey) {
    switch (image.type) {
      case AssetType.Image:
        this.load.image(assetKey, toS3Path(image.path, true));
        break;
      case AssetType.Sprite:
        this.load.spritesheet(assetKey, toS3Path(image.path, true), image.config);
        break;
      default:
        break;
    }
  }

  //////////////////////
  // Location Helpers //
  //////////////////////

  public async create() {
    GameGlobalAPI.getInstance().hideLayer(Layer.Character);
    await this.changeLocationTo(this.currentLocationId, true);
    await GameGlobalAPI.getInstance().saveGame();
  }

  /**
   * Render a location, the assets related to it (objects, character);
   * before executing the following in order (if available):
   *
   * Start Action, Notification, Cutscene
   *
   * Start action is only played when startAction argument is set to true;
   * commonly only the first time user loads the checkpoint.
   *
   * @param locationId id of the location to render
   * @param startAction if set to true, startAction will be executed
   */
  private async renderLocation(locationId: LocationId, startAction: boolean) {
    const gameLocation = GameGlobalAPI.getInstance().getLocationAtId(locationId);

    // Render the toolbar in every location
    this.getToolbarManager().renderToolbarContainer();

    // Play the BGM attached to the location
    await GameGlobalAPI.getInstance().playBgMusic(gameLocation.bgmKey);

    // Render all assets related to the location
    this.getBackgroundManager().renderBackgroundLayerContainer(locationId);
    this.getObjectManager().renderObjectsLayerContainer(locationId);
    this.getBBoxManager().renderBBoxLayerContainer(locationId);
    this.getCharacterManager().renderCharacterLayerContainer(locationId);

    await this.getPhaseManager().swapPhase(GamePhaseType.Sequence);

    if (startAction) {
      // Execute fast forward actions
      await this.getActionManager().fastForwardGameActions(
        this.getStateManager().getTriggeredStateChangeActions()
      );
      // Game start actions
      await this.getActionManager().processGameActions(
        this.getStateManager().getGameMap().getGameStartActions()
      );
    }

    // Location cutscene
    await this.getActionManager().processGameActions(gameLocation.actionIds);

    // Location notification
    if (this.getStateManager().hasLocationNotif(locationId)) {
      await GameGlobalAPI.getInstance().bringUpUpdateNotif(gameLocation.name);
      this.getStateManager().removeLocationNotif(locationId);
    }

    if (this.getPhaseManager().isCurrentPhase(GamePhaseType.Sequence)) {
      await this.getPhaseManager().swapPhase(GamePhaseType.Menu);
    }
  }

  /**
   * Change the current location to another location, based on the ID.
   * This will properly clean up the previous location. It is highly
   * encouraged to only change location of the game using this method.
   *
   * @param locationId id of location to be changed into
   * @param startAction if set to true, start action will be triggered
   */
  public async changeLocationTo(locationId: LocationId, startAction: boolean = false) {
    this.currentLocationId = locationId;

    // Transition to the new location
    await blackFade(this, 300, 500, async () => {
      await this.getLayerManager().clearAllLayers();
      await this.renderLocation(locationId, startAction);
    });

    // Update state after location is fully rendered, location has been visited
    this.getStateManager().triggerInteraction(locationId);
  }

  /**
   * Bind escape menu, dashboard, and mode selections to keyboard triggers.
   */
  private bindKeyboardTriggers() {
    this.getInputManager().registerKeyboardListener(keyboardShortcuts.Menu, 'up', async () => {
      if (this.getPhaseManager().isCurrentPhaseTerminal()) {
        await this.getPhaseManager().popPhase();
      } else {
        await this.getPhaseManager().pushPhase(GamePhaseType.EscapeMenu);
      }
    });
    this.getInputManager().registerKeyboardListener(keyboardShortcuts.Dashboard, 'up', async () => {
      if (this.getPhaseManager().isCurrentPhase(GamePhaseType.Dashboard)) {
        await this.getPhaseManager().popPhase();
      } else if (this.getPhaseManager().isCurrentPhaseTerminal()) {
        await this.getPhaseManager().swapPhase(GamePhaseType.Dashboard);
      } else {
        await this.getPhaseManager().pushPhase(GamePhaseType.Dashboard);
      }
    });
    this.registerMenuKeyboardListener(
      keyboardShortcuts.Explore,
      GameMode.Explore,
      GamePhaseType.Explore
    );
    this.registerMenuKeyboardListener(keyboardShortcuts.Move, GameMode.Move, GamePhaseType.Move);
    this.registerMenuKeyboardListener(keyboardShortcuts.Talk, GameMode.Talk, GamePhaseType.Talk);
  }

  /**
   * Helper function to register keyboard listeners for mode selections.
   */
  private registerMenuKeyboardListener(shortcut: number, mode: GameMode, phase: GamePhaseType) {
    this.getInputManager().registerKeyboardListener(shortcut, 'up', async () => {
      const modes = this.getCurrentLocationModes();
      if (modes.includes(mode) && this.getPhaseManager().isCurrentPhase(GamePhaseType.Menu)) {
        await this.getPhaseManager().pushPhase(phase);
      } else if (this.getPhaseManager().isCurrentPhase(phase)) {
        await this.getPhaseManager().swapPhase(GamePhaseType.Menu);
      }
    });
  }

  /**
   * the same method from GameModeMenu to get the available modes under current location
   */
  private getCurrentLocationModes() {
    const currLocId = this.currentLocationId;
    let latestModesInLoc = this.getStateManager().getLocationModes(currLocId);
    const talkTopics = GameGlobalAPI.getInstance().getGameItemsInLocation(
      GameItemType.talkTopics,
      currLocId
    );

    // Remove talk mode if there is no talk topics
    if (talkTopics.length === 0) {
      latestModesInLoc = latestModesInLoc.filter(mode => mode !== GameMode.Talk);
    }

    return latestModesInLoc;
  }

  /**
   * Clean up on related managers
   */
  public cleanUp() {
    this.getInputManager().clearListeners();
    this.getLayerManager().clearAllLayers();
    this.getDialogueStorageManager().clearDialogueStorage();
  }

  /**
   * Checks whether game is able to transition to the next checkpoint.
   * Game is only able to transition to the next checkpoint
   * if all of the objectives of the current checkpoint has been cleared.
   *
   * We also do not want to go Transition scene if players have just
   * completed the chapter so that they can don't get kicked out of the
   * chapter if they've already finished it before.
   * This is unless they press replay, which sets their chapNewlyCompleted back to false.
   *
   * Additionally, game will only transition if the newPhase is not Sequence phase;
   * in order to ensure that we don't transition to the next checkpoint
   * during dialogue/cutscene.
   *
   * This method is passed to the phase manager, as the interrupt checker.
   *
   * @param prevPhase previous phase to transition from
   * @param newPhase new phase to transition to
   */
  public transitionChecker(prevPhase: GamePhaseType, newPhase: GamePhaseType) {
    return (
      !this.hasTransitioned &&
      newPhase !== GamePhaseType.Sequence &&
      GameGlobalAPI.getInstance().areAllObjectivesComplete() &&
      !this.getStateManager().getChapterNewlyCompleted()
    );
  }

  /**
   * Transition to the next checkpoint and resets the input setting.
   *
   * This method is passed to the phase manager
   * as the interrupt transition callback.
   */
  public async checkpointTransition() {
    this.hasTransitioned = true;

    await this.getActionManager().processGameActions(
      this.getStateManager().getGameMap().getCheckpointCompleteActions()
    );

    // Reset input and cursor, in case it is changed after story complete actions
    this.getInputManager().setDefaultCursor(Constants.defaultCursor);
    this.getInputManager().enableMouseInput(true);
    this.getInputManager().enableKeyboardInput(true);

    this.tweens.add(fadeIn([blackScreen(this).setAlpha(0)], Constants.fadeDuration));
    await sleep(Constants.fadeDuration);

    // Clean up all layers & current storage
    this.cleanUp();

    // Start the next Checkpoint
    this.scene.start('CheckpointTransition');
  }

  /**
   * Handle when character layer should be shown and hidden.
   * Character layer should only be shown when student is at
   * Menu Mode.
   *
   * This method is passed to the phase manager, to be executed on
   * every phase transition.
   *
   * @param prevPhase previous phase to transition from
   * @param newPhase new phase to transition to
   */
  public async handleCharacterLayer(prevPhase: GamePhaseType, newPhase: GamePhaseType) {
    if (prevPhase === GamePhaseType.Menu) {
      GameGlobalAPI.getInstance().fadeOutLayer(Layer.Character);
    }

    if (newPhase === GamePhaseType.Menu) {
      GameGlobalAPI.getInstance().fadeInLayer(Layer.Character);
    }
  }

  public getSaveManager = () => SourceAcademyGame.getInstance().getSaveManager();
  public getStateManager = () => mandatory(this.stateManager);
  public getObjectManager = () => mandatory(this.objectManager);
  public getDialogueManager = () => mandatory(this.dialogueManager);
  public getCharacterManager = () => mandatory(this.characterManager);
  public getBBoxManager = () => mandatory(this.boundingBoxManager);
  public getActionManager = () => mandatory(this.actionManager);
  public getInputManager = () => mandatory(this.inputManager);
  public getLayerManager = () => mandatory(this.layerManager);
  public getPhaseManager = () => mandatory(this.phaseManager);
  public getBackgroundManager = () => mandatory(this.backgroundManager);
  public getAnimationManager = () => mandatory(this.animationManager);
  public getPopupManager = () => mandatory(this.popUpManager);
  public getEscapeManager = () => mandatory(this.escapeManager);
  public getCollectibleManager = () => mandatory(this.collectibleManager);
  public getAchievementManager = () => mandatory(this.achievementManager);
  public getLogManager = () => mandatory(this.logManager);
  public getDialogueStorageManager = () => mandatory(this.dialogueStorageManager);
  public getToolbarManager = () => mandatory(this.toolbarManager);
  public getTaskLogManager = () => mandatory(this.taskLogManager);
  public getDashboardManager = () => mandatory(this.dashboardManager);
  public getQuizManager = () => mandatory(this.quizManager);
}

export default GameManager;
