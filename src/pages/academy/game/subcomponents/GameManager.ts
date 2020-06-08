import LocationSelectChapter from './scenes/LocationSelectChapter';
import { GameChapter } from 'src/features/game/chapter/GameChapterTypes';
import GameMap from 'src/features/game/location/GameMap';
import { GameLocation } from 'src/features/game/location/GameMapTypes';
import GameModeMenu from 'src/features/game/modeMenu/GameModeMenu';
import modeUIAssets from 'src/features/game/modeMenu/GameModeMenuTypes';
import GameModeMenuManager from 'src/features/game/modeMenu/GameModeMenuManager';
import { GameMode } from 'src/features/game/mode/GameModeTypes';

class GameManager extends Phaser.Scene {
  private locationModeMenus: Map<string, GameModeMenu>;
  private UIContainers: Map<GameMode, Phaser.GameObjects.Container>;
  private currentlyActiveUI: GameMode;

  constructor() {
    super('GameManager');
    this.locationModeMenus = new Map<string, GameModeMenu>();
    this.UIContainers = new Map<GameMode, Phaser.GameObjects.Container>();
    this.currentlyActiveUI = GameMode.Menu;
  }

  public preload() {
    this.preloadLocationsAssets(LocationSelectChapter);
    this.preloadUIAssets();
    this.locationModeMenus = GameModeMenuManager.processModeMenus(this, LocationSelectChapter);
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
    const locationModeMenu = this.locationModeMenus.get(location.name);
    if (locationModeMenu) {
      const modeMenuContainer = locationModeMenu.getUIContainer(this);
      this.UIContainers.set(GameMode.Menu, modeMenuContainer);
      this.add.existing(modeMenuContainer);
      modeMenuContainer.setVisible(false);
      modeMenuContainer.setActive(false);

      // By default, activate Menu mode
      locationModeMenu.activateUI(this, modeMenuContainer);
      this.currentlyActiveUI = GameMode.Menu;
    }
  }

  //////////////////////
  //   Menu Helpers   //
  //////////////////////

  private preloadUIAssets() {
    modeUIAssets.forEach(modeUIAsset => this.load.image(modeUIAsset.key, modeUIAsset.path));
  }

  //////////////////////
  //   Mode Callback  //
  //////////////////////

  public changeModeTo(newMode: GameMode, refresh?: boolean) {
    if (!refresh && this.currentlyActiveUI === newMode) {
      return;
    }
    // tslint:disable-next-line
    console.log('Handling callback: ', newMode);
  }
}

export default GameManager;
