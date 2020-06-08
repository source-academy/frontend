import LocationSelectChapter from './scenes/LocationSelectChapter';
import { GameChapter } from 'src/features/game/chapter/GameChapterTypes';
import { GameLocation } from 'src/features/game/location/GameMapTypes';
import { GameImage } from 'src/features/game/commons/CommonsTypes';
import modeUIAssets from 'src/features/game/UI/GameModeMenuTypes';

class GameManager extends Phaser.Scene {
  constructor() {
    super('GameManager');
  }

  public preload() {
    this.preloadLocationsAssets(LocationSelectChapter);
    this.preloadUIAssets();

  }

  public create() {
    this.renderStartingLocation(LocationSelectChapter);
  }

  //////////////////////
  // Location Helpers //
  //////////////////////

  private preloadLocationsAssets(chapter: GameChapter) {
    chapter.map.getLocations().forEach(location => this.load.image(location.key, location.backgroundImage.path));
  }

  private renderStartingLocation(chapter: GameChapter) {
    const startingLoc = LocationSelectChapter.startingLoc;
    const location = LocationSelectChapter.map.getLocation(startingLoc);
    if (location) {
      this.renderLocation(location);
    }
  }

  private renderLocation(location: GameLocation) {
    const modeUI = this.handleLocationMode(location);
    this.add.image(location.backgroundImage.xPos, location.backgroundImage.yPos, location.key);
    modeUI.forEach(ui => this.add.image(ui.xPos, ui.yPos, ui.key));
  }

  //////////////////////
  //   Menu Helpers   //
  //////////////////////

  private preloadUIAssets() {
    modeUIAssets.forEach(modeUIAsset => this.load.image(modeUIAsset.key, modeUIAsset.path));
  }

  private handleLocationModeUI(location: GameLocation): Array<GameImage> {
    
    if (location.mode) {

    }
    return new Array<GameImage>();
  }

}
export default GameManager;
