import { GameChapter } from 'src/features/game/chapter/GameChapterTypes';
import GameMap from 'src/features/game/location/GameMap';
import { GameLocation } from 'src/features/game/location/GameMapTypes';
import { GameMode } from 'src/features/game/mode/GameModeTypes';
import LocationSelectChapter from '../../../../features/game/scenes/LocationSelectChapter';
import GameActionManager from '../../../../features/game/action/GameActionManager';
import GameModeManager from 'src/features/game/mode/GameModeManager';
import GameLayerManager from 'src/features/game/layer/GameLayerManager';
import GameCharacterManager from 'src/features/game/character/GameCharacterManager';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { blackFade } from 'src/features/game/effects/FadeEffect';
import { addLoadingScreen } from 'src/features/game/utils/LoadingScreen';
import GameStateManager from 'src/features/game/state/GameStateManager';
import GameObjectManager from 'src/features/game/objects/GameObjectManager';
import { screenSize, screenCenter } from 'src/features/game/commons/CommonConstants';
import commonAssets from 'src/features/game/commons/CommonAssets';

const { Image } = Phaser.GameObjects;
type GameManagerProps = {
  text: string;
};

class GameManager extends Phaser.Scene {
  public currentChapter: GameChapter;

  // Limited to current chapter
  public modeManager: GameModeManager;
  public layerManager: GameLayerManager;
  public stateManager: GameStateManager;
  public objectManager: GameObjectManager;
  public characterManager: GameCharacterManager;

  // Limited to current location
  public currentLocationName: string;
  private currentActiveMode: GameMode;

  constructor() {
    super('GameManager');

    this.currentChapter = LocationSelectChapter;
    this.currentLocationName = this.currentChapter.startingLoc;

    this.modeManager = new GameModeManager();
    this.layerManager = new GameLayerManager();
    this.stateManager = new GameStateManager();
    this.characterManager = new GameCharacterManager();
    this.objectManager = new GameObjectManager();

    this.currentActiveMode = GameMode.Menu;

    GameActionManager.getInstance().setGameManager(this);
  }

  init({ text }: GameManagerProps) {
    this.currentChapter = LocationSelectChapter;
  }

  public preload() {
    addLoadingScreen(this);
    this.preloadLocationsAssets(this.currentChapter);
    this.preloadBaseAssets();

    this.modeManager.processModes(this.currentChapter);
    this.layerManager.initialiseMainLayer(this);
    this.stateManager.processChapter(this.currentChapter);
    this.objectManager.processObjects(this.currentChapter);
    this.characterManager.processCharacter(this.currentChapter);
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
    const backgroundAsset = new Image(
      this,
      screenCenter.x,
      screenCenter.y,
      location.assetKey
    ).setDisplaySize(screenSize.x, screenSize.y);
    this.layerManager.addToLayer(Layer.Background, backgroundAsset);

    // Render objects in the location
    this.objectManager.renderObjectsLayerContainer(location.name);

    // Render characters in the location
    this.characterManager.renderCharacterLayerContainer(location.name);

    // Render characters in the location
    const characterLayerContainer = this.characterManager.getCharacterLayerContainer(location.name);
    this.layerManager.addToLayer(Layer.Character, characterLayerContainer);

    // By default, activate Menu mode
    this.changeModeTo(GameMode.Menu, true, true);
  }

  public async changeLocationTo(locationName: string) {
    const location = this.currentChapter.map.getLocation(locationName);
    if (location) {
      // Deactive current UI of previous location
      this.deactivateCurrentUI();

      // Clear all layers;
      this.layerManager.clearAllLayers();

      // Update location
      this.currentLocationName = locationName;

      // Render new location
      await blackFade(this, 300, 300, () => this.renderLocation(this.currentChapter.map, location));

      // Update state after location is fully rendered
      this.stateManager.triggerInteraction(locationName);
    }
  }

  //////////////////////
  //   Mode Callback  //
  //////////////////////

  private deactivateCurrentUI() {
    const prevLocationMode = this.modeManager.getLocationMode(
      this.currentActiveMode,
      this.currentLocationName
    );

    if (prevLocationMode) {
      prevLocationMode.deactivateUI();
    }
  }

  public changeModeTo(newMode: GameMode, refresh?: boolean, skipDeactivate?: boolean) {
    if (!refresh && this.currentActiveMode === newMode) {
      return;
    }

    const locationMode = this.modeManager.getLocationMode(newMode, this.currentLocationName);

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
