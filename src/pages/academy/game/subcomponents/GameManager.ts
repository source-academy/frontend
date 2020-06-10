import { GameChapter } from 'src/features/game/chapter/GameChapterTypes';
import GameMap from 'src/features/game/location/GameMap';
import { GameLocation } from 'src/features/game/location/GameMapTypes';
import GameModeMenu from 'src/features/game/mode/menu/GameModeMenu';
import modeUIAssets from 'src/features/game/mode/menu/GameModeMenuTypes';
import GameModeMenuManager from 'src/features/game/mode/menu/GameModeMenuManager';
import { GameMode } from 'src/features/game/mode/GameModeTypes';
import GameModeMoveManager from 'src/features/game/mode/move/GameModeMoveManager';
import GameModeMove from 'src/features/game/mode/move/GameModeMove';
import LocationSelectChapter from '../../../../features/game/scenes/LocationSelectChapter';
import { IGameUI, screenSize } from 'src/features/game/commons/CommonsTypes';
import GameModeExploreManager from 'src/features/game/mode/explore/GameModeExploreManager';
import GameModeExplore from 'src/features/game/mode/explore/GameModeExplore';
import moveUIAssets from 'src/features/game/mode/move/GameModeMoveTypes';
import exploreUIAssets from 'src/features/game/mode/explore/GameModeExploreTypes';
import GameActionManager from './GameActionManager';
import GameModeTalk from 'src/features/game/mode/talk/GameModeTalk';
import GameModeTalkManager from 'src/features/game/mode/talk/GameModeTalkManager';
import talkUIAssets from 'src/features/game/mode/talk/GameModeTalkTypes';

class GameManager extends Phaser.Scene {
  public currentChapter: GameChapter;
  public currentLocationName: string;

  // Limited to current chapter
  private locationModeMenus: Map<string, GameModeMenu>;
  private locationModeMoves: Map<string, GameModeMove>;
  private locationModeTalks: Map<string, GameModeTalk>;
  private locationModeExplore: Map<string, GameModeExplore>;

  // Limited to current location
  private currentUIContainers: Map<GameMode, Phaser.GameObjects.Container>;
  private currentActiveMode: GameMode;

  constructor() {
    super('GameManager');

    this.currentChapter = LocationSelectChapter;
    this.currentLocationName = this.currentChapter.startingLoc;

    this.locationModeMenus = new Map<string, GameModeMenu>();
    this.locationModeMoves = new Map<string, GameModeMove>();
    this.locationModeTalks = new Map<string, GameModeTalk>();
    this.locationModeExplore = new Map<string, GameModeExplore>();

    this.currentUIContainers = new Map<GameMode, Phaser.GameObjects.Container>();
    this.currentActiveMode = GameMode.Menu;

    GameActionManager.getInstance().setGameManager(this);
  }

  public preload() {
    this.preloadLocationsAssets(this.currentChapter);
    this.preloadAssets();

    this.locationModeMenus = GameModeMenuManager.processModeMenus(this.currentChapter);
    this.locationModeMoves = GameModeMoveManager.processMoveMenus(this.currentChapter);
    this.locationModeTalks = GameModeTalkManager.processTalkMenus(this.currentChapter);
    this.locationModeExplore = GameModeExploreManager.processExploreMenus(this.currentChapter);
  }

  public create() {
    this.renderStartingLocation(this.currentChapter);
  }

  //////////////////////
  // Location Helpers //
  //////////////////////

  private preloadLocationsAssets(chapter: GameChapter) {
    chapter.map.getLocationAssets().forEach(asset => {
      this.load.image(asset.key, asset.path);
    });
  }

  private renderStartingLocation(chapter: GameChapter) {
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

  private preloadAssets() {
    modeUIAssets.forEach(modeUIAsset => this.load.image(modeUIAsset.key, modeUIAsset.path));
    moveUIAssets.forEach(moveUIAsset => this.load.image(moveUIAsset.key, moveUIAsset.path));
    talkUIAssets.forEach(talkUIAsset => this.load.image(talkUIAsset.key, talkUIAsset.path));
    exploreUIAssets.forEach(exploreUIAsset =>
      this.load.image(exploreUIAsset.key, exploreUIAsset.path)
    );
  }

  private getUIContainers(location: GameLocation) {
    // Get Mode Menu
    const locationModeMenu = this.locationModeMenus.get(location.name);
    if (locationModeMenu) {
      const modeMenuContainer = locationModeMenu.getUIContainer();
      this.currentUIContainers.set(GameMode.Menu, modeMenuContainer);
    }

    // Get Move Menu
    const locationMoveMenu = this.locationModeMoves.get(location.name);
    if (locationMoveMenu) {
      const moveMenuContainer = locationMoveMenu.getUIContainer();
      this.currentUIContainers.set(GameMode.Move, moveMenuContainer);
    }

    // Get Talk Menu
    const locationTalkMenu = this.locationModeTalks.get(location.name);
    if (locationTalkMenu) {
      const talkMenuContainer = locationTalkMenu.getUIContainer();
      this.currentUIContainers.set(GameMode.Talk, talkMenuContainer);
    }

    // TODO: Fetch remaining UIContainers
    // Get Move Menu
    const locationModeExplore = this.locationModeExplore.get(location.name);
    if (locationModeExplore) {
      const moveMenuContainer = locationModeExplore.getUIContainer();
      this.currentUIContainers.set(GameMode.Move, moveMenuContainer);
    }

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
      case GameMode.Talk:
        return this.locationModeTalks.get(this.currentLocationName);
      case GameMode.Explore:
        return this.locationModeMoves.get(this.currentLocationName);
      default:
        // tslint:disable-next-line
        console.log('Not implemented yet: ', mode, ' , returning mode menu instead');
        return this.locationModeMenus.get(this.currentLocationName);
    }
  }

  private deactivateCurrentUI() {
    const prevContainer = this.currentUIContainers.get(this.currentActiveMode);
    const prevLocationMode = this.getLocationMode(this.currentActiveMode);
    if (prevLocationMode && prevContainer) {
      prevLocationMode.deactivateUI(prevContainer);
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
        this.deactivateCurrentUI();
      }

      // Activate new UI
      locationMode.activateUI(modeContainer);
      this.currentActiveMode = newMode;
    }
  }
}

export default GameManager;
