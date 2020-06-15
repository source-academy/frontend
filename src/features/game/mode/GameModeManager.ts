import { IGameUI } from '../commons/CommonsTypes';
import { GameMode } from 'src/features/game/mode/GameModeTypes';
import { GameChapter } from '../chapter/GameChapterTypes';
import GameModeMenuManager from './menu/GameModeMenuManager';
import GameModeTalkManager from './talk/GameModeTalkManager';
import GameModeMoveManager from './move/GameModeMoveManager';
import GameModeExploreManager from './explore/GameModeExploreManager';
import GameActionManager from 'src/features/game/action/GameActionManager';
import { LocationId } from '../location/GameMapTypes';

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
      locToUI.forEach((gameUI, locationId, map) => {
        if (!this.gameModes.get(locationId)) {
          this.gameModes.set(locationId, new Map<GameMode, IGameUI>());
        }
        if (gameUI) {
          this.gameModes.get(locationId)!.set(mode, gameUI);
        }
      });
    });
  }

  public addMode(mode: GameMode, locationId: LocationId) {
    if (!this.gameModes.get(locationId)) {
      this.gameModes.set(locationId, new Map<GameMode, IGameUI>());
    }
    const chapter = GameActionManager.getInstance().getGameManager()!.currentChapter;
    if (!chapter) return;

    let gameUI: IGameUI;
    if (mode === GameMode.Menu) {
      gameUI = GameModeMenuManager.processLocation(chapter, locationId);
    } else if (mode === GameMode.Talk) {
      gameUI = GameModeTalkManager.processLocation(chapter, locationId);
    } else if (mode === GameMode.Move) {
      gameUI = GameModeMoveManager.processLocation(chapter, locationId);
    } else if (mode === GameMode.Explore) {
      gameUI = GameModeExploreManager.processLocation(chapter, locationId);
    } else {
      return;
    }
    this.gameModes.get(locationId)!.set(mode, gameUI);
  }

  public removeMode(mode: GameMode, locationId: string) {
    this.gameModes.get(locationId)!.delete(mode);
  }

  public getLocationMode(mode: GameMode, locationId: string): IGameUI | undefined {
    return this.gameModes.get(locationId)!.get(mode);
  }
}

export default GameModeManager;
