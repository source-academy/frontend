/* tslint:disable */
import { GameChapter } from 'src/features/game/chapter/GameChapterTypes';
import GameMap from 'src/features/game/location/GameMap';
import { GameLocation, GameItemTypeDetails } from 'src/features/game/location/GameMapTypes';
import { GameMode } from 'src/features/game/mode/GameModeTypes';
import LocationSelectChapter from '../../../../features/game/scenes/LocationSelectChapter';
import { screenSize } from 'src/features/game/commons/CommonsTypes';
import GameActionManager from './GameActionManager';
import { loadDialogueAssetsFromText } from 'src/features/game/parser/DialoguePreloader';
import { loadObjectsAssetsFromText } from 'src/features/game/parser/ObjectsPreloader';
import { SampleDialogue, SampleObjects } from 'src/features/game/scenes/LocationAssets';
import GameModeManager from 'src/features/game/mode/GameModeManager';
import { createObjectsLayer } from 'src/features/game/objects/ObjectsRenderer';
import LayerManager from 'src/features/game/layer/LayerManager';
import { Layer } from 'src/features/game/layer/LayerTypes';
import { blackFade } from 'src/features/game/utils/GameEffects';

const { Image } = Phaser.GameObjects;

class GameManager extends Phaser.Scene {
  public currentChapter: GameChapter;
  public currentLocationName: string;

  // Limited to current chapter
  private gameModeManager: GameModeManager;
  public layerManager: LayerManager;

  // Limited to current location
  private currentUIContainers: Map<GameMode, Phaser.GameObjects.Container>;
  private currentActiveMode: GameMode;

  constructor() {
    super('GameManager');

    this.currentChapter = LocationSelectChapter;

    this.currentLocationName = this.currentChapter.startingLoc;

    this.gameModeManager = new GameModeManager();
    this.layerManager = new LayerManager();

    this.currentUIContainers = new Map<GameMode, Phaser.GameObjects.Container>();
    this.currentActiveMode = GameMode.Menu;

    GameActionManager.getInstance().setGameManager(this);
  }

  public preload() {
    this.layerManager.initialiseMainLayer(this);
    this.preloadLocationsAssets(this.currentChapter);
    this.preloadChapterAssets();

    this.gameModeManager.preloadModeBaseAssets();
    this.gameModeManager.processModes(this.currentChapter);
  }

  public create() {
    this.renderStartingLocation();
  }

  private preloadChapterAssets() {
    loadDialogueAssetsFromText(this, SampleDialogue);
    loadObjectsAssetsFromText(this, SampleObjects);
  }

  //////////////////////
  // Location Helpers //
  //////////////////////

  private preloadLocationsAssets(chapter: GameChapter) {
    chapter.map.getLocationAssets().forEach(asset => {
      this.load.image(asset.key, asset.path);
    });
  }

  private renderStartingLocation() {
    const startingLoc = this.currentChapter.startingLoc;
    const location = this.currentChapter.map.getLocation(startingLoc);
    if (location) {
      this.renderLocation(this.currentChapter.map, location);
    }
  }

  private async renderLocation(map: GameMap, location: GameLocation) {
    this.layerManager.clearSeveralLayers([Layer.Background, Layer.Objects]);
    // Render background of the location
    const asset = map.getLocationAsset(location);
    if (asset) {
      const backgroundAsset = new Image(
        this,
        location.assetXPos,
        location.assetYPos,
        location.assetKey
      ).setDisplaySize(screenSize.x, screenSize.y);
      this.layerManager.addToLayer(Layer.Background, backgroundAsset);
    }

    // Render objects in the location
    const [, objectLayerContainer] = createObjectsLayer(
      this,
      map.getItemAt(location.name, GameItemTypeDetails.Object)
    );
    this.layerManager.addToLayer(Layer.Objects, objectLayerContainer);

    // Get all necessary UI containers
    this.getUIContainers(location);

    // By default, activate Menu mode
    this.changeModeTo(GameMode.Menu, true, true);

    // Update
    this.currentLocationName = location.name;
  }

  public async changeLocationTo(locationName: string) {
    const location = this.currentChapter.map.getLocation(locationName);
    if (location) {
      // Deactive current UI
      this.deactivateCurrentUI();

      // Reset UI Containers on new location
      this.currentUIContainers.clear();

      // Render new location
      await blackFade(this, 500, 500, () => this.renderLocation(this.currentChapter.map, location));
    }
  }

  //////////////////////
  //   Menu Helpers   //
  //////////////////////

  private getUIContainers(location: GameLocation) {
    this.currentUIContainers = this.gameModeManager.getModeContainers(location.name);

    // Disable all UI at first
    this.currentUIContainers.forEach(container => {
      this.layerManager.addToLayer(Layer.UI, container);
      container.setVisible(false);
      container.setActive(false);
    });
  }

  //////////////////////
  //   Mode Callback  //
  //////////////////////

  private deactivateCurrentUI() {
    const prevContainer = this.currentUIContainers.get(this.currentActiveMode);
    const prevLocationMode = this.gameModeManager.getLocationMode(
      this.currentActiveMode,
      this.currentLocationName
    );
    if (prevLocationMode && prevContainer) {
      prevLocationMode.deactivateUI(prevContainer);
    }
  }

  public changeModeTo(newMode: GameMode, refresh?: boolean, skipDeactivate?: boolean) {
    if (!refresh && this.currentActiveMode === newMode) {
      return;
    }

    const modeContainer = this.currentUIContainers.get(newMode);
    const locationMode = this.gameModeManager.getLocationMode(newMode, this.currentLocationName);

    if (locationMode && modeContainer) {
      if (!skipDeactivate) {
        this.deactivateCurrentUI();
      }

      // Activate new UI
      locationMode.activateUI(modeContainer);
      this.currentActiveMode = newMode;
    }
  }
}

export default GameManager;
