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
import { addLoadingScreen } from 'src/features/game/utils/LoadingScreen';
import GameStateManager from 'src/features/game/state/GameStateManager';
import GameObjectManager from 'src/features/game/objects/GameObjectManager';
import { screenSize, screenCenter } from 'src/features/game/commons/CommonConstants';
import commonAssets from 'src/features/game/commons/CommonAssets';
import GameActionExecuter from 'src/features/game/action/GameActionExecuter';
import GameUserStateManager from 'src/features/game/state/GameUserStateManager';
import Parser from 'src/features/game/parser/Parser';
import { hasDevAccess } from 'src/features/game/utils/GameAccess';
import GameBBoxManager from 'src/features/game/boundingBoxes/GameBoundingBoxManager';
import GamePopUpManager from 'src/features/game/popUp/GamePopUpManager';
import { AccountInfo } from 'src/features/game/scenes/chapterSelect/ChapterSelect';
import { GameSaveManager } from '../../save/GameSaveManager';

type GameManagerProps = {
  accountInfo: AccountInfo;
  text: string;
  continueGame: boolean;
  chapterNum: number;
};

class GameManager extends Phaser.Scene {
  public currentChapter: GameChapter;

  // Limited to current chapter
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

  // Limited to current location
  public currentLocationId: LocationId;
  private currentActiveMode: GameMode;
  private currentActivePhase: GamePhase;

  constructor() {
    super('GameManager');

    this.currentChapter = LocationSelectChapter;
    this.currentLocationId = this.currentChapter.startingLoc;

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

    this.currentActiveMode = GameMode.Menu;
    this.currentActivePhase = GamePhase.Standard;

    GameActionManager.getInstance().setGameManager(this);
  }

  async init({ text, accountInfo, continueGame, chapterNum }: GameManagerProps) {
    chapterNum = 0;
    continueGame = true;
    this.currentChapter = Parser.parse(text);

    await this.saveManager.initialise(accountInfo, chapterNum);
    this.stateManager.initialise(
      this.currentChapter,
      continueGame ? this.saveManager.getLoadedGameStoryState() : undefined
    );
    this.userStateManager.initialise(this.saveManager.getLoadedUserState());

    this.dialogueManager.initialise(this.currentChapter.map.getDialogues());
    this.characterManager.initialise(this.currentChapter.map.getCharacters());
    this.modeManager.initialise(this.currentChapter);
  }

  public preload() {
    addLoadingScreen(this);
    this.preloadLocationsAssets(this.currentChapter);
    this.preloadBaseAssets();

    this.layerManager.initialiseMainLayer(this);
    this.objectManager.processObjects(this.currentChapter);
    this.boundingBoxManager.processBBox(this.currentChapter);
  }

  public create() {
    this.changeLocationTo(this.currentChapter.startingLoc);
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

    // By default, activate Menu mode
    this.changeModeTo(GameMode.Menu, true, true);
  }

  public async changeLocationTo(locationId: LocationId) {
    const location = this.currentChapter.map.getLocation(locationId);
    if (!location) {
      if (hasDevAccess()) {
        throw new Error(`Location ${locationId} not found`);
      }
      return;
    }

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
}

export default GameManager;
