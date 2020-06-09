import { GameChapter } from 'src/features/game/chapter/GameChapterTypes';
import GameMap from 'src/features/game/location/GameMap';
import { GameLocation } from 'src/features/game/location/GameMapTypes';
import GameModeMenu from 'src/features/game/modeMenu/GameModeMenu';
import modeUIAssets from 'src/features/game/modeMenu/GameModeMenuTypes';
import GameModeMenuManager from 'src/features/game/modeMenu/GameModeMenuManager';
import { GameMode } from 'src/features/game/mode/GameModeTypes';
import GameModeMoveManager from 'src/features/game/mode/move/GameModeMoveManager';
import GameModeMove from 'src/features/game/mode/move/GameModeMove';
import LocationSelectChapter from './scenes/LocationSelectChapter';

class GameManager extends Phaser.Scene {
  public currentChapter: GameChapter;

  // Limited to current chapter
  private locationModeMenus: Map<string, GameModeMenu>;
  private locationMoveMenus: Map<string, GameModeMove>;

  // Limited to current location
  private currentUIContainers: Map<GameMode, Phaser.GameObjects.Container>;
  private currentActiveUI: GameMode;

  constructor() {
    super('GameManager');

    this.currentChapter = LocationSelectChapter;

    this.locationModeMenus = new Map<string, GameModeMenu>();
    this.locationMoveMenus = new Map<string, GameModeMove>();

    this.currentUIContainers = new Map<GameMode, Phaser.GameObjects.Container>();
    this.currentActiveUI = GameMode.Menu;
  }

  public preload() {
    this.preloadLocationsAssets(this.currentChapter);
    this.preloadUIAssets();

    this.locationModeMenus = GameModeMenuManager.processModeMenus(this, this.currentChapter);
    this.locationMoveMenus = GameModeMoveManager.processMoveMenus(this, this.currentChapter);
  }

  public create() {
    this.renderStartingLocation(this.currentChapter);
  }

  //////////////////////
  // Location Helpers //
  //////////////////////

  private preloadLocationsAssets(chapter: GameChapter) {
    chapter.map.getLocationAssets().forEach(asset => this.load.image(asset.key, asset.path));
  }

  private renderStartingLocation(chapter: GameChapter) {
    const startingLoc = this.currentChapter.startingLoc;
    const location = this.currentChapter.map.getLocation(startingLoc);
    if (location) {
      this.renderLocation(this.currentChapter.map, location);
    }
  }

  private renderLocation(map: GameMap, location: GameLocation) {
    // Clean up canvas

    // Render background of the location
    const asset = map.getLocationAsset(location);
    if (asset) {
      this.add.image(location.assetXPos, location.assetYPos, location.assetKey);
    }

    // Reset UI Containers on new location
    this.currentUIContainers.clear();

    // Get all necessary UI containers
    this.getUIContainers(location);

    // By default, activate Menu mode
    const locationModeMenu = this.locationModeMenus.get(location.name);
    const modeMenuContainer = this.currentUIContainers.get(GameMode.Menu);
    if (locationModeMenu && modeMenuContainer) {
      locationModeMenu.activateUI(this, modeMenuContainer);
      this.currentActiveUI = GameMode.Menu;
    }
  }

  //////////////////////
  //   Menu Helpers   //
  //////////////////////

  private preloadUIAssets() {
    modeUIAssets.forEach(modeUIAsset => this.load.image(modeUIAsset.key, modeUIAsset.path));
  }

  private getUIContainers(location: GameLocation) {
    // Get Mode Menu
    const locationModeMenu = this.locationModeMenus.get(location.name);
    if (locationModeMenu) {
      const modeMenuContainer = locationModeMenu.getUIContainer(this);
      this.currentUIContainers.set(GameMode.Menu, modeMenuContainer);
    }

    // Get Move Menu
    const locationMoveMenu = this.locationMoveMenus.get(location.name);
    if (locationMoveMenu) {
      const moveMenuContainer = locationMoveMenu.getUIContainer(this);
      this.currentUIContainers.set(GameMode.Move, moveMenuContainer);
    }

    // TODO: Fetch remaining UIContainers

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

  public changeModeTo(newMode: GameMode, refresh?: boolean) {
    if (!refresh && this.currentActiveUI === newMode) {
      return;
    }
    // tslint:disable-next-line
    console.log('Handling callback: ', newMode);
  }
}

export default GameManager;
