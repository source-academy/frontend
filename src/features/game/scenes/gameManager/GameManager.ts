import { GameChapter } from 'src/features/game/chapter/GameChapterTypes';
import GameMap from 'src/features/game/location/GameMap';
import { GameLocation, LocationId } from 'src/features/game/location/GameMapTypes';
import { GameMode, GamePhase } from 'src/features/game/mode/GameModeTypes';
import LocationSelectChapter from '../LocationSelectChapter';
import GameActionManager from '../../action/GameActionManager';
import GameModeManager from 'src/features/game/mode/GameModeManager';
import GameLayerManager from 'src/features/game/layer/GameLayerManager';
import GameCharacterManager from 'src/features/game/character/GameCharacterManager';
import GameDialogueManager from 'src/features/game/dialogue/GameDialogueManager';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { blackFade } from 'src/features/game/effects/FadeEffect';
import { addLoadingScreen } from 'src/features/game/effects/LoadingScreen';
import GameStateManager from 'src/features/game/state/GameStateManager';
import GameObjectManager from 'src/features/game/objects/GameObjectManager';
import { screenSize, screenCenter } from 'src/features/game/commons/CommonConstants';
import commonAssets from 'src/features/game/commons/CommonAssets';
import GameActionExecuter from 'src/features/game/action/GameActionExecuter';
import GameUserStateManager from 'src/features/game/state/GameUserStateManager';
import Parser from 'src/features/game/parser/Parser';
import GameBBoxManager from 'src/features/game/boundingBoxes/GameBoundingBoxManager';
import GamePopUpManager from 'src/features/game/popUp/GamePopUpManager';
import game, { AccountInfo } from 'src/pages/academy/game/subcomponents/phaserGame';
import { GameSaveManager } from '../../save/GameSaveManager';
import GameSoundManager from '../../sound/GameSoundManager';
import GameEscapeManager from '../../escape/GameEscapeManager';

type GameManagerProps = {
  accountInfo: AccountInfo;
  text: string;
  continueGame: boolean;
  chapterNum: number;
};

class GameManager extends Phaser.Scene {
  public currentChapter: GameChapter;
  public currentLocationId: LocationId;
  private currentActiveMode: GameMode;
  private currentActivePhase: GamePhase;

  public modeManager: GameModeManager;
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

  constructor() {
    super('GameManager');

    this.currentChapter = LocationSelectChapter;
    this.currentLocationId = this.currentChapter.startingLoc;
    this.currentActiveMode = GameMode.Menu;
    this.currentActivePhase = GamePhase.Standard;

    this.modeManager = new GameModeManager();
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

    GameActionManager.getInstance().setGameManager(this);
  }

  async init({ text, continueGame, chapterNum }: GameManagerProps) {
    this.currentChapter = Parser.parse(text);

    // Load state if possible
    const accountInfo = game.getAccountInfo();
    if (accountInfo) {
      await this.saveManager.initialise(accountInfo, chapterNum);
      this.stateManager.initialise(
        this.currentChapter,
        continueGame ? this.saveManager.getLoadedGameStoryState() : undefined
      );
    } else {
      this.stateManager.initialise(this.currentChapter, undefined);
    }

    this.soundManager.initialise(this);
    this.dialogueManager.initialise(this.currentChapter.map.getDialogues());
    this.characterManager.initialise(this.currentChapter.map.getCharacters());
    this.modeManager.initialise(this.currentChapter);
    this.actionExecuter.initialise(this.currentChapter.map.getActions());
    this.boundingBoxManager.initialise();
    this.objectManager.initialise();
  }

  public preload() {
    addLoadingScreen(this);
    this.preloadLocationsAssets(this.currentChapter);
    this.preloadBaseAssets();

    this.layerManager.initialiseMainLayer(this);
    this.soundManager.loadSounds(this.currentChapter.map.getSoundAssets());

    this.bindEscapeMenu();
  }

  public async create() {
    this.changeLocationTo(this.currentChapter.startingLoc);
    await GameActionManager.getInstance().saveGame();
  }

  private preloadBaseAssets() {
    commonAssets.forEach(asset => {
      this.load.image(asset.key, asset.path);
    });
  }

  //////////////////////
  // Location Helpers //
  //////////////////////

  private preloadLocationsAssets(chapter: GameChapter) {
    chapter.map.getMapAssets().forEach((assetPath, assetKey) => {
      this.load.image(assetKey, assetPath);
    });
  }

  private async renderLocation(map: GameMap, location: GameLocation) {
    // Render background of the location
    const backgroundAsset = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      location.assetKey
    ).setDisplaySize(screenSize.x, screenSize.y);
    this.layerManager.addToLayer(Layer.Background, backgroundAsset);

    // Render objects & bbox in the location
    this.objectManager.renderObjectsLayerContainer(location.id);
    this.boundingBoxManager.renderBBoxLayerContainer(location.id);

    // Render characters in the location
    this.characterManager.renderCharacterLayerContainer(location.id);

    // Play background music at the location
    if (location.bgmKey) {
      this.soundManager.playBgMusic(location.bgmKey);
    } else {
      this.soundManager.stopCurrBgMusic();
    }

    // Notify players that location is not yet visited/has new update
    if (!this.stateManager.hasTriggeredInteraction(location.id)) {
      await GameActionManager.getInstance().bringUpUpdateNotif(location.name);
    }

    // By default, activate Menu mode
    this.changeModeTo(GameMode.Menu, true, true);
  }

  public async changeLocationTo(locationId: LocationId) {
    const location = this.currentChapter.map.getLocationAtId(locationId);

    // Deactive current UI of previous location
    this.deactivateCurrentUI();

    // Update location
    this.currentLocationId = locationId;

    // Render new location
    await blackFade(this, 300, 300, () => {
      this.layerManager.clearAllLayers();
      this.renderLocation(this.currentChapter.map, location);
    });

    // Update state after location is fully rendered
    this.stateManager.triggerInteraction(locationId);
  }

  //////////////////////
  //   Mode Callback  //
  //////////////////////

  public deactivateCurrentUI() {
    const currentLocationMode = this.modeManager.getLocationMode(
      this.currentActiveMode,
      this.currentLocationId
    );
    if (currentLocationMode) currentLocationMode.deactivateUI();
  }

  public activateCurrentUI() {
    const currentLocationMode = this.modeManager.getLocationMode(
      this.currentActiveMode,
      this.currentLocationId
    );
    if (currentLocationMode) currentLocationMode.activateUI();
  }

  public setActivePhase(gamePhase: GamePhase) {
    this.currentActivePhase = gamePhase;
  }

  public getActivePhase(): GamePhase {
    return this.currentActivePhase;
  }

  public changeModeTo(newMode: GameMode, refresh?: boolean, skipDeactivate?: boolean) {
    if (!refresh && this.currentActiveMode === newMode) {
      return;
    }

    const locationMode = this.modeManager.getLocationMode(newMode, this.currentLocationId);

    if (newMode === GameMode.Menu || newMode === GameMode.Talk) {
      this.layerManager.fadeInLayer(Layer.Character, 300);
    } else {
      this.layerManager.fadeOutLayer(Layer.Character, 300);
    }

    if (locationMode) {
      if (!skipDeactivate) {
        this.deactivateCurrentUI();
      }

      // Activate new UI
      locationMode.activateUI();
      this.currentActiveMode = newMode;
    }
  }

  //////////////////////
  //   Mode Callback  //
  //////////////////////

  private bindEscapeMenu() {
    const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey.on('up', () => this.escapeManager.toggleEscapeMenu());
  }
}

export default GameManager;
