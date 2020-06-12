import { IGameUI } from '../commons/CommonsTypes';
import { GameMode } from 'src/features/game/mode/GameModeTypes';
import { GameChapter } from '../chapter/GameChapterTypes';
import GameModeMenuManager from './menu/GameModeMenuManager';
import GameModeTalkManager from './talk/GameModeTalkManager';
import GameModeMoveManager from './move/GameModeMoveManager';
import GameModeExploreManager from './explore/GameModeExploreManager';
import GameActionManager from 'src/features/game/action/GameActionManager';
import modeUIAssets from './menu/GameModeMenuConstants';
import moveUIAssets from './move/GameModeMoveConstants';
import talkUIAssets from './talk/GameModeTalkTypes';
import exploreUIAssets from './explore/GameModeExploreConstants';

class GameModeManager {
  private gameModes: Map<string, Map<GameMode, IGameUI>>;

  constructor() {
    this.gameModes = new Map<string, Map<GameMode, IGameUI>>();
  }

  public processModes(chapter: GameChapter) {
    const locationModes = new Map<GameMode, Map<string, IGameUI>>();
    locationModes.set(GameMode.Menu, GameModeMenuManager.processModeMenus(chapter));
    locationModes.set(GameMode.Talk, GameModeTalkManager.processTalkMenus(chapter));
    locationModes.set(GameMode.Move, GameModeMoveManager.processMoveMenus(chapter));
    locationModes.set(GameMode.Explore, GameModeExploreManager.processExploreMenus(chapter));

    locationModes.forEach((locToUI, mode, map) => {
      locToUI.forEach((gameUI, locationName, map) => {
        if (!this.gameModes.get(locationName)) {
          this.gameModes.set(locationName, new Map<GameMode, IGameUI>());
        }
        if (gameUI) {
          this.gameModes.get(locationName)!.set(mode, gameUI);
        }
      });
    });
  }

  public preloadModeBaseAssets() {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('Unable to preload mode base assets');
    }
    const modeAssets = [modeUIAssets, moveUIAssets, talkUIAssets, exploreUIAssets];
    modeAssets.forEach(assets =>
      assets.forEach(asset => gameManager.load.image(asset.key, asset.path))
    );
  }

  public getModeContainers(locationName: string): Map<GameMode, Phaser.GameObjects.Container> {
    const modeContainers = new Map<GameMode, Phaser.GameObjects.Container>();
    const locationModes = this.gameModes.get(locationName);
    if (locationModes) {
      locationModes.forEach((modeUI, mode, map) => {
        const modeContainer = modeUI.getUIContainer();
        modeContainers.set(mode, modeContainer);
      });
    }
    return modeContainers;
  }

  public getLocationMode(mode: GameMode, locationName: string): IGameUI | undefined {
    return this.gameModes.get(locationName)!.get(mode);
  }
}

export default GameModeManager;
