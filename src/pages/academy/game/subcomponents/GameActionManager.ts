import GameManager from './GameManager';
import { GameMode } from 'src/features/game/mode/GameModeTypes';

class GameActionManager {
  private gameManager: GameManager | undefined;
  static instance: GameActionManager;

  private constructor() {
    this.gameManager = undefined;
  }

  static getInstance() {
    if (!GameActionManager.instance) {
      GameActionManager.instance = new GameActionManager();
    }
    return GameActionManager.instance;
  }

  public setGameManager(gameManagerRef: GameManager): void {
    this.gameManager = gameManagerRef;
  }

  public changeModeTo(newMode: GameMode, refresh?: boolean, skipDeactivate?: boolean): void {
    if (this.gameManager) {
      return this.gameManager.changeModeTo(newMode, refresh, skipDeactivate);
    }
  }

  public changeLocationTo(locationName: string): void {
    if (this.gameManager) {
      return this.gameManager.changeLocationTo(locationName);
    }
  }

  public getGameManager(): GameManager | undefined {
    return this.gameManager;
  }
}

export default GameActionManager;
