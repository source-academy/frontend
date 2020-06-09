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
import { IGameUI } from 'src/features/game/commons/CommonsTypes';
import moveUIAssets from 'src/features/game/mode/move/GameModeMoveTypes';

class GameManager extends Phaser.Scene {
  public currentChapter: GameChapter;
  public currentLocationName: string;

  // Limited to current chapter
  private locationModeMenus: Map<string, GameModeMenu>;
  private locationModeMoves: Map<string, GameModeMove>;

  // Limited to current location
  private currentUIContainers: Map<GameMode, Phaser.GameObjects.Container>;
  private currentActiveMode: GameMode;

  constructor() {
    super('GameManager');

    this.currentChapter = LocationSelectChapter;
    this.currentLocationName = this.currentChapter.startingLoc;

    this.locationModeMenus = new Map<string, GameModeMenu>();
    this.locationModeMoves = new Map<string, GameModeMove>();

    this.currentUIContainers = new Map<GameMode, Phaser.GameObjects.Container>();
    this.currentActiveMode = GameMode.Menu;
  }

  public preload() {
    this.preloadLocationsAssets(this.currentChapter);
    this.preloadUIAssets();

    this.locationModeMenus = GameModeMenuManager.processModeMenus(this, this.currentChapter);
    this.locationModeMoves = GameModeMoveManager.processMoveMenus(this, this.currentChapter);
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
    this.changeModeTo(GameMode.Menu, true, true);

    // Update
    this.currentLocationName = location.name;
  }

  public changeLocationTo(locationName: string): void {
    // Deactive current UI

    // Black fade in

    // this.renderLocation()

    // Black fade out
  }

  //////////////////////
  //   Menu Helpers   //
  //////////////////////

  private preloadUIAssets() {
    modeUIAssets.forEach(modeUIAsset => this.load.image(modeUIAsset.key, modeUIAsset.path));
    moveUIAssets.forEach(moveUIAsset => this.load.image(moveUIAsset.key, moveUIAsset.path));
  }

  private getUIContainers(location: GameLocation) {
    // Get Mode Menu
    const locationModeMenu = this.locationModeMenus.get(location.name);
    if (locationModeMenu) {
      const modeMenuContainer = locationModeMenu.getUIContainer(this);
      this.currentUIContainers.set(GameMode.Menu, modeMenuContainer);
    }

    // Get Move Menu
    const locationMoveMenu = this.locationModeMoves.get(location.name);
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

  private getLocationMode(mode: GameMode): IGameUI | undefined {
    switch (mode) {
      case GameMode.Menu:
        return this.locationModeMenus.get(this.currentLocationName);
      case GameMode.Move:
        return this.locationModeMoves.get(this.currentLocationName);
      default:
        // TODO: Handle
        // tslint:disable-next-line
        console.log('Not implemented yet: ', mode, ' , returning mode menu instead');
        return this.locationModeMenus.get(this.currentLocationName);
    }
  }

  public changeModeTo(newMode: GameMode, refresh?: boolean, skipDeactivate?: boolean) {
    if (!refresh && this.currentActiveMode === newMode) {
      return;
    }

    const modeContainer = this.currentUIContainers.get(newMode);
    const locationMode = this.getLocationMode(newMode);

    if (locationMode && modeContainer) {
      if (!skipDeactivate) {
        // Deactivate previous UI
        const prevContainer = this.currentUIContainers.get(this.currentActiveMode);
        const prevLocationMode = this.getLocationMode(this.currentActiveMode);
        if (prevLocationMode && prevContainer) {
          prevLocationMode.deactivateUI(this, prevContainer);
        }
      }

      // Activate new UI
      locationMode.activateUI(this, modeContainer);
      this.currentActiveMode = newMode;
    }
  }
}

export default GameManager;
