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
import talkUIAssets from './talk/GameModeTalkConstants';
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

  public addMode(mode: GameMode, locationName: string) {
    if (!this.gameModes.get(locationName)) {
      this.gameModes.set(locationName, new Map<GameMode, IGameUI>());
    }
    const chapter = GameActionManager.getInstance().getGameManager()!.currentChapter;
    if (!chapter) return;

    let gameUI: IGameUI;
    if (mode === GameMode.Menu) {
      gameUI = GameModeMenuManager.processLocation(chapter, locationName);
    } else if (mode === GameMode.Talk) {
      gameUI = GameModeTalkManager.processLocation(chapter, locationName);
    } else if (mode === GameMode.Move) {
      gameUI = GameModeMoveManager.processLocation(chapter, locationName);
    } else if (mode === GameMode.Explore) {
      gameUI = GameModeExploreManager.processLocation(chapter, locationName);
    } else {
      return;
    }
    this.gameModes.get(locationName)!.set(mode, gameUI);
  }

  public removeMode(mode: GameMode, locationName: string) {
    this.gameModes.get(locationName)!.delete(mode);
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

  public getLocationMode(mode: GameMode, locationName: string): IGameUI | undefined {
    return this.gameModes.get(locationName)!.get(mode);
  }
}

export default GameModeManager;
