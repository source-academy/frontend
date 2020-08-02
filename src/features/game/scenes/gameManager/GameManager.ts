import GameActionManager from '../../action/GameActionManager';
import GameAwardsManager from '../../awards/GameAwardsManager';
import GameBackgroundManager from '../../background/GameBackgroundManager';
import GameBBoxManager from '../../boundingBoxes/GameBoundingBoxManager';
import { GameCheckpoint } from '../../chapter/GameChapterTypes';
import GameCharacterManager from '../../character/GameCharacterManager';
import { Constants } from '../../commons/CommonConstants';
import GameDialogueManager from '../../dialogue/GameDialogueManager';
import { blackFade, blackScreen, fadeIn } from '../../effects/FadeEffect';
import { addLoadingScreen } from '../../effects/LoadingScreen';
import GameEscapeManager from '../../escape/GameEscapeManager';
import GameInputManager from '../../input/GameInputManager';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import { LocationId } from '../../location/GameMapTypes';
import GameObjectManager from '../../objects/GameObjectManager';
import GamePhaseManager from '../../phase/GamePhaseManager';
import { GamePhaseType } from '../../phase/GamePhaseTypes';
import GamePopUpManager from '../../popUp/GamePopUpManager';
import SourceAcademyGame from '../../SourceAcademyGame';
import GameStateManager from '../../state/GameStateManager';
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
  private inputManager?: GameInputManager;
  private escapeManager?: GameEscapeManager;
  private awardManager?: GameAwardsManager;

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
    this.popUpManager = new GamePopUpManager();
    this.escapeManager = new GameEscapeManager(this);
    this.awardManager = new GameAwardsManager(this);
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
    gameMap.getMapAssets().forEach((assetPath, assetKey) => {
      this.load.image(assetKey, toS3Path(assetPath));
    });
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
   * Start action is only played whe startAction argument is set to true;
   * commonly only the first time user loads the checkpoint.
   *
   * @param locationId id of the location to render
   * @param startAction if set to true, startAction will be executed
   */
  private async renderLocation(locationId: LocationId, startAction: boolean) {
    const gameLocation = GameGlobalAPI.getInstance().getLocationAtId(locationId);

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

    // Location notification
    if (this.getStateManager().hasLocationNotif(locationId)) {
      await GameGlobalAPI.getInstance().bringUpUpdateNotif(gameLocation.name);
      this.getStateManager().removeLocationNotif(locationId);
    }

    // Location cutscene
    await this.getActionManager().processGameActions(gameLocation.actionIds);
    await this.getPhaseManager().swapPhase(GamePhaseType.Menu);
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
   * Bind escape menu and awards menu to keyboard triggers.
   */
  private bindKeyboardTriggers() {
    this.getInputManager().registerKeyboardListener(
      Phaser.Input.Keyboard.KeyCodes.ESC,
      'up',
      async () => {
        if (this.getPhaseManager().isCurrentPhase(GamePhaseType.EscapeMenu)) {
          await this.getPhaseManager().popPhase();
        } else {
          await this.getPhaseManager().pushPhase(GamePhaseType.EscapeMenu);
        }
      }
    );
    this.getInputManager().registerKeyboardListener(
      Phaser.Input.Keyboard.KeyCodes.TAB,
      'up',
      async () => {
        if (this.getPhaseManager().isCurrentPhase(GamePhaseType.AwardMenu)) {
          await this.getPhaseManager().popPhase();
        } else {
          await this.getPhaseManager().pushPhase(GamePhaseType.AwardMenu);
        }
      }
    );
  }

  /**
   * Clean up on related managers
   */
  public cleanUp() {
    this.getInputManager().clearListeners();
    this.getLayerManager().clearAllLayers();
  }

  /**
   * Checks whether game is able to transition to the next checkpoint.
   * Game is only able to transition to the next checkpoint
   * if all of the objectives of the current checkpoint has been cleared.
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
      GameGlobalAPI.getInstance().isAllComplete()
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

    this.cleanUp();
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
  public getPopupManager = () => mandatory(this.popUpManager);
  public getEscapeManager = () => mandatory(this.escapeManager);
  public getAwardManager = () => mandatory(this.awardManager);
}

export default GameManager;
