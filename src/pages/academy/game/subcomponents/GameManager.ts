import LocationSelectChapter from './scenes/LocationSelectChapter';
import { GameChapter } from 'src/features/game/chapter/GameChapterTypes';
import GameMap from 'src/features/game/location/GameMap';
import { GameLocation } from 'src/features/game/location/GameMapTypes';
import GameModeMenu from 'src/features/game/modeMenu/GameModeMenu';
import modeUIAssets from 'src/features/game/modeMenu/GameModeMenuTypes';
import GameModeMenuManager from 'src/features/game/modeMenu/GameModeMenuManager';

class GameManager extends Phaser.Scene {
  private locationModeMenus: Map<string, GameModeMenu>;

  constructor() {
    super('GameManager');

    this.locationModeMenus = new Map<string, GameModeMenu>();
  }

  public preload() {
    this.preloadLocationsAssets(LocationSelectChapter);
    this.preloadUIAssets();
    this.locationModeMenus = GameModeMenuManager.processModeMenus(LocationSelectChapter);
  }

  public create() {
    this.renderStartingLocation(LocationSelectChapter);
  }

  //////////////////////
  // Location Helpers //
  //////////////////////

  private preloadLocationsAssets(chapter: GameChapter) {
    chapter.map.getLocationAssets().forEach(asset => this.load.image(asset.key, asset.path));
  }

  private renderStartingLocation(chapter: GameChapter) {
    const startingLoc = LocationSelectChapter.startingLoc;
    const location = LocationSelectChapter.map.getLocation(startingLoc);
    if (location) {
      this.renderLocation(LocationSelectChapter.map, location);
    }
  }

  private renderLocation(map: GameMap, location: GameLocation) {
    // Render background of the location
    const asset = map.getLocationAsset(location);
    if (asset) {
      this.add.image(location.assetXPos, location.assetYPos, location.assetKey);
    }

    // Render mode menu
    const modeUI = this.locationModeMenus.get(location.name);
    if (modeUI) {
      modeUI.renderUI(this);
    }
  }

  //////////////////////
  //   Menu Helpers   //
  //////////////////////

  private preloadUIAssets() {
    modeUIAssets.forEach(modeUIAsset => this.load.image(modeUIAsset.key, modeUIAsset.path));
  }
}

export default GameManager;
