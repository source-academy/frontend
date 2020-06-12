/* tslint:disable */
import { GameChapter } from 'src/features/game/chapter/GameChapterTypes';
import GameMap from 'src/features/game/location/GameMap';
import { GameLocation } from 'src/features/game/location/GameMapTypes';
import { GameMode } from 'src/features/game/mode/GameModeTypes';
import LocationSelectChapter from '../../../../features/game/scenes/LocationSelectChapter';
import { screenSize } from 'src/features/game/commons/CommonsTypes';
import GameActionManager from '../../../../features/game/action/GameActionManager';
import { loadDialogueAssetsFromText } from 'src/features/game/parser/DialoguePreloader';
import { loadObjectsAssetsFromText } from 'src/features/game/parser/ObjectsPreloader';
import { SampleDialogue, SampleObjects } from 'src/features/game/scenes/LocationAssets';
import GameModeManager from 'src/features/game/mode/GameModeManager';
import { createObjectsLayer } from 'src/features/game/objects/ObjectsRenderer';
import LayerManager from 'src/features/game/layer/LayerManager';
import { Layer } from 'src/features/game/layer/LayerTypes';
import { blackFade, blackFadeIn } from 'src/features/game/utils/GameEffects';
import { GameItemTypeDetails } from 'src/features/game/location/GameMapConstants';
import { addLoadingScreen } from 'src/features/game/storyChapterSelect/LoadingScreen';
import { GameParser } from 'src/features/game/parser/GameParser';
import GameStateManager from 'src/features/game/state/GameStateManager';

const { Image } = Phaser.GameObjects;
type GameManagerProps = {
  fileName: string;
};

class GameManager extends Phaser.Scene {
  public currentChapter: GameChapter;
  public currentLocationName: string;

  // Limited to current chapter
  public modeManager: GameModeManager;
  public layerManager: LayerManager;
  public stateManager: GameStateManager;

  // Limited to current location
  private currentUIContainers: Map<GameMode, Phaser.GameObjects.Container>;
  private currentActiveMode: GameMode;

  constructor() {
    super('GameManager');

    this.currentChapter = LocationSelectChapter;
    this.currentLocationName = this.currentChapter.startingLoc;

    this.modeManager = new GameModeManager();
    this.layerManager = new LayerManager();
    this.stateManager = new GameStateManager();

    this.currentUIContainers = new Map<GameMode, Phaser.GameObjects.Container>();
    this.currentActiveMode = GameMode.Menu;

    GameActionManager.getInstance().setGameManager(this);
  }

  init({ fileName }: GameManagerProps) {
    const text = this.cache.text.get(fileName);
    this.currentChapter = GameParser.parse(text);
  }

  public preload() {
    addLoadingScreen(this);
    this.preloadLocationsAssets(this.currentChapter);
    this.preloadChapterAssets();

    this.modeManager.preloadModeBaseAssets();
    this.modeManager.processModes(this.currentChapter);
    this.layerManager.initialiseMainLayer(this);
    this.stateManager.processChapter(this.currentChapter);
  }

  public create() {
    this.changeLocationTo(this.currentChapter.startingLoc);
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

  private async renderLocation(map: GameMap, location: GameLocation) {
    this.layerManager.clearSeveralLayers([Layer.Background, Layer.Objects]);
    blackFadeIn(this, { fadeDuration: 1000 });

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
    const objectIdsToRender = location.objects || [];
    const [, objectLayerContainer] = createObjectsLayer(
      this,
      objectIdsToRender,
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
      await blackFade(this, 300, 300, () => this.renderLocation(this.currentChapter.map, location));

      // Update state after location is fully rendered
      this.stateManager.visitedLocation(locationName);
    }
  }

  //////////////////////
  //   Menu Helpers   //
  //////////////////////

  private getUIContainers(location: GameLocation) {
    this.currentUIContainers = this.modeManager.getModeContainers(location.name);

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
    const prevLocationMode = this.modeManager.getLocationMode(
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
    const locationMode = this.modeManager.getLocationMode(newMode, this.currentLocationName);

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
