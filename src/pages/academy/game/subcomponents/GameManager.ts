import LocationSelectChapter from './scenes/LocationSelectChapter';
import { GameChapter } from 'src/features/game/chapter/GameChapterTypes';
import GameMap from 'src/features/game/location/GameMap';
import { GameLocation } from 'src/features/game/location/GameMapTypes';
import GameModeMenu from 'src/features/game/UI/GameModeMenu';
import { GameMode } from 'src/features/game/mode/GameModeTypes';
import modeUIAssets, { modeButtonStyle } from 'src/features/game/UI/GameModeMenuTypes';

class GameManager extends Phaser.Scene {
  private locationModeMenus: Map<string, GameModeMenu>;

  constructor() {
    super('GameManager');

    this.locationModeMenus = new Map<string, GameModeMenu>();
  }

  public preload() {
    this.preloadLocationsAssets(LocationSelectChapter);
    this.preloadUIAssets();

    this.processModeMenus(LocationSelectChapter);
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
      modeUI.getModeButtons().forEach(button => {
        this.add.image(button.assetXPos, button.assetYPos, button.assetKey);
        
        const text = button.text ? button.text : '';
        this.add.text(button.assetXPos, button.assetYPos, text, modeButtonStyle).setOrigin(0.5, 0.25);
      });
    }
  }

  //////////////////////
  //   Menu Helpers   //
  //////////////////////

  private preloadUIAssets() {
    modeUIAssets.forEach(modeUIAsset => this.load.image(modeUIAsset.key, modeUIAsset.path));
  }

  private processModeMenus(chapter: GameChapter) {
    chapter.map.getLocations().forEach(location => {
      const modeMenus = new GameModeMenu();

      if (location.modes) { 
        location.modes.forEach(mode => modeMenus.addModeButton(mode));
      }

      // By default, we include Move mode
      modeMenus.addModeButton(GameMode.Move);

      this.locationModeMenus.set(location.name, modeMenus);
    });
  }

}
export default GameManager;
