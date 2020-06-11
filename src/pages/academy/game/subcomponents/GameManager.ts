import { GameChapter } from 'src/features/game/chapter/GameChapterTypes';
import GameMap from 'src/features/game/location/GameMap';
import { GameLocation } from 'src/features/game/location/GameMapTypes';
import { GameMode } from 'src/features/game/mode/GameModeTypes';
import LocationSelectChapter from '../../../../features/game/scenes/LocationSelectChapter';
import { screenSize } from 'src/features/game/commons/CommonsTypes';
import GameActionManager from './GameActionManager';
import { loadDialogueAssetsFromText } from 'src/features/game/parser/DialoguePreloader';
import { loadObjectsAssetsFromText } from 'src/features/game/parser/ObjectsPreloader';
import { SampleDialogue, SampleObjects } from 'src/features/game/scenes/LocationAssets';
import GameModeManager from 'src/features/game/mode/GameModeManager';

class GameManager extends Phaser.Scene {
  public currentChapter: GameChapter;
  public currentLocationName: string;

  // Limited to current chapter
  private gameModeManager: GameModeManager;

  // Limited to current location
  private currentUIContainers: Map<GameMode, Phaser.GameObjects.Container>;
  private currentActiveMode: GameMode;

  constructor() {
    super('GameManager');

    this.currentChapter = LocationSelectChapter;

    this.currentLocationName = this.currentChapter.startingLoc;

    this.gameModeManager = new GameModeManager();

    this.currentUIContainers = new Map<GameMode, Phaser.GameObjects.Container>();
    this.currentActiveMode = GameMode.Menu;

    GameActionManager.getInstance().setGameManager(this);
  }

  public preload() {
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

  private renderLocation(map: GameMap, location: GameLocation) {
    // Render background of the location
    const asset = map.getLocationAsset(location);
    if (asset) {
      const backgroundAsset = this.add.image(
        location.assetXPos,
        location.assetYPos,
        location.assetKey
      );
      backgroundAsset.setDisplaySize(screenSize.x, screenSize.y);
    }

    // Get all necessary UI containers
    this.getUIContainers(location);

    // By default, activate Menu mode
    this.changeModeTo(GameMode.Menu, true, true);

    // Update
    this.currentLocationName = location.name;
  }

  public changeLocationTo(locationName: string): void {
    const location = this.currentChapter.map.getLocation(locationName);
    if (location) {
      // Deactive current UI
      this.deactivateCurrentUI();

      // Reset UI Containers on new location
      this.currentUIContainers.clear();

      // Render new location
      this.renderLocation(this.currentChapter.map, location);
    }
  }

  //////////////////////
  //   Menu Helpers   //
  //////////////////////

  private getUIContainers(location: GameLocation) {
    this.currentUIContainers = this.gameModeManager.getModeContainers(location.name);

    // Disable all UI at first
    this.currentUIContainers.forEach(container => {
      this.add.existing(container);
      container.setVisible(false);
      container.setActive(false);
    });
  }

  //////////////////////
  //   Mode Callback  //
  //////////////////////

  private deactivateCurrentUI() {
    const prevContainer = this.currentUIContainers.get(this.currentActiveMode);
    const prevLocationMode = this.gameModeManager.getLocationMode(this.currentActiveMode, this.currentLocationName);
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
