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
import GameInputManager from '../../input/GameInputManager';

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
import { mandatory } from '../../utils/GameUtils';
import { displayNotification } from '../../effects/Notification';

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

  private layerManager?: GameLayerManager;
  private stateManager?: GameStateManager;
  private objectManager?: GameObjectManager;
  private characterManager?: GameCharacterManager;
  private dialogueManager?: GameDialogueManager;
  private actionExecuter?: GameActionExecuter;
  private userStateManager?: GameUserStateManager;
  private boundingBoxManager?: GameBBoxManager;
  private popUpManager?: GamePopUpManager;
  private saveManager?: GameSaveManager;
  private soundManager?: GameSoundManager;
  private escapeManager?: GameEscapeManager;
  private phaseManager?: GamePhaseManager;
  private backgroundManager?: GameBackgroundManager;
  private inputManager?: GameInputManager;

  constructor() {
    super('GameManager');
    this.currentCheckpoint = LocationSelectChapter;
    this.fullSaveState = undefined;
    this.continueGame = false;
    this.chapterNum = -1;
    this.checkpointNum = -1;
    this.currentLocationId = this.currentCheckpoint.startingLoc;
    this.isStorySimulator = false;
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
  }

  public preload() {
    addLoadingScreen(this);
    this.preloadBaseAssets();
    this.preloadLocationsAssets(this.currentCheckpoint);
    this.initialiseManagers();
    this.bindEscapeMenu();
  }

  private initialiseManagers() {
    this.layerManager = new GameLayerManager(this);
    this.saveManager = new GameSaveManager();
    this.loadGameState();
    this.phaseManager = new GamePhaseManager(this);
    this.stateManager = new GameStateManager(this);
    this.userStateManager = new GameUserStateManager(this.getSaveManager().getLoadedUserState());
    this.soundManager = new GameSoundManager(this, this.parentGame || getSourceAcademyGame());
    this.dialogueManager = new GameDialogueManager(this);
    this.characterManager = new GameCharacterManager(this);
    this.actionExecuter = new GameActionExecuter(this);
    this.boundingBoxManager = new GameBBoxManager(this);
    this.objectManager = new GameObjectManager(this);
    this.backgroundManager = new GameBackgroundManager(this);
    this.inputManager = new GameInputManager(this);
    this.escapeManager = new GameEscapeManager(this);
    this.soundManager.loadSounds(this.currentCheckpoint.map.getSoundAssets());
  }

  //////////////////////
  //     Getters      //
  //////////////////////

  private getParentGame = () => mandatory(this.parentGame, 'game') as SourceAcademyGame;
  public getAccountInfo = () => mandatory(this.accountInfo, 'accountInfo') as AccountInfo;
  public getSaveManager = () => mandatory(this.saveManager) as GameSaveManager;
  public getStateManager = () => mandatory(this.stateManager) as GameStateManager;
  public getLayerManager = () => mandatory(this.layerManager) as GameLayerManager;
  public getObjectManager = () => mandatory(this.objectManager) as GameObjectManager;
  public getCharacterManager = () => mandatory(this.characterManager) as GameCharacterManager;
  public getDialogueManager = () => mandatory(this.dialogueManager) as GameDialogueManager;
  public getActionExecuter = () => mandatory(this.actionExecuter) as GameActionExecuter;
  public getUserStateManager = () => mandatory(this.userStateManager) as GameUserStateManager;
  public getBBoxManager = () => mandatory(this.boundingBoxManager) as GameBBoxManager;
  public getPhaseManager = () => mandatory(this.phaseManager) as GamePhaseManager;
  public getBackgroundManager = () => mandatory(this.backgroundManager) as GameBackgroundManager;
  public getSoundManager = () => mandatory(this.soundManager) as GameSoundManager;
  public getPopupManager = () => mandatory(this.popUpManager) as GamePopUpManager;
  public getEscapeManager = () => mandatory(this.escapeManager) as GameEscapeManager;
  public getInputManager = () => mandatory(this.inputManager) as GameInputManager;

  //////////////////////
  //    Preload       //
  //////////////////////

  private loadGameState() {
    this.accountInfo = this.getParentGame().getAccountInfo();
    if (this.isStorySimulator && this.accountInfo.role === 'staff') {
      this.getSaveManager().initialiseForStaff(this.accountInfo);
    } else if (!this.isStorySimulator && this.accountInfo.role === 'student') {
      this.getSaveManager().initialiseForGame(
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
    this.getSaveManager().saveGame(this);
  }

  private async renderLocation(locationId: LocationId) {
    const gameLocation = this.currentCheckpoint.map.getLocationAtId(locationId);
    await this.getSoundManager().renderBackgroundMusic(gameLocation.bgmKey);
    this.getBackgroundManager().renderBackgroundLayerContainer(locationId);
    this.getObjectManager().renderObjectsLayerContainer(locationId);
    this.getBBoxManager().renderBBoxLayerContainer(locationId);
    this.getCharacterManager().renderCharacterLayerContainer(locationId);
    this.getLayerManager().showLayer(Layer.Character);

    await this.getPhaseManager().swapPhase(GamePhaseType.Sequence);

    // Notify players that location is not yet visited/has new update
    if (!this.getStateManager().hasTriggeredInteraction(locationId)) {
      await displayNotification(this, gameLocation.name);
    }
    await this.getActionExecuter().executeStoryActions(gameLocation.actionIds);
    await this.getPhaseManager().swapPhase(GamePhaseType.Menu);
  }

  public async changeLocationTo(locationId: LocationId) {
    this.currentLocationId = locationId;

    await blackFade(this, 300, 500, async () => {
      await this.getLayerManager().clearAllLayers();
      await this.renderLocation(locationId);
    });

    // Update state after location is fully rendered
    this.getStateManager().triggerInteraction(locationId);
  }

  private bindEscapeMenu() {
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
  }

  public cleanUp() {
    this.getInputManager().clearListeners();
    this.getLayerManager().clearAllLayers();
  }

  public async checkpointTransition() {
    if (this.getStateManager().isAllComplete()) {
      if (this.isStorySimulator) {
        this.scene.start('StorySimulatorMenu');
      } else {
        this.scene.start('CheckpointTransition');
      }
    }
  }
}

export default GameManager;
