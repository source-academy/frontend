import GameManager from './GameManager';
import { GameMode } from 'src/features/game/mode/GameModeTypes';
import { DialogueObject } from 'src/features/game/dialogue/DialogueTypes';
import { createDialogue } from 'src/features/game/dialogue/DialogueRenderer';

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

  public changeLocationTo(locationName: string) {
    if (this.gameManager) {
      return this.gameManager.changeLocationTo(locationName);
    }
    return;
  }

  public getGameManager(): GameManager | undefined {
    return this.gameManager;
  }

  public async bringUpDialogue(dialogueObject: DialogueObject) {
    if (this.gameManager) {
      const [activateDialogue] = createDialogue(this.gameManager, dialogueObject);
      await activateDialogue;
    }
  }
}

export default GameActionManager;
