import GameManager from '../../../pages/academy/game/subcomponents/GameManager';
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

  /////////////////////
  //   Game Manager  //
  /////////////////////

  public getGameManager(): GameManager | undefined {
    return this.gameManager;
  }

  public setGameManager(gameManagerRef: GameManager): void {
    this.gameManager = gameManagerRef;
  }

  /////////////////////
  //    Game Mode    //
  /////////////////////

  public getLocationMode(locationName: string): GameMode[] | undefined {
    if (this.gameManager) {
      return this.gameManager.stateManager.getLocationMode(locationName);
    }
    return undefined;
  }

  public addLocationMode(currLocName: string, locationName: string, mode: GameMode): void {
    if (this.gameManager) {
      return this.gameManager.stateManager.addLocationMode(currLocName, locationName, mode);
    }
    return;
  }

  public removeLocationMode(currLocName: string, locationName: string, mode: GameMode) {
    if (this.gameManager) {
      return this.gameManager.stateManager.removeLocationMode(currLocName, locationName, mode);
    }
    return;
  }

  public changeLocationModeTo(
    newMode: GameMode,
    refresh?: boolean,
    skipDeactivate?: boolean
  ): void {
    if (this.gameManager) {
      return this.gameManager.changeModeTo(newMode, refresh, skipDeactivate);
    }
    return;
  }

  /////////////////////
  //  Game Locations //
  /////////////////////

  public hasVisitedLocation(locationName: string): boolean | undefined {
    if (this.gameManager) {
      return this.gameManager.stateManager.hasVisitedLocation(locationName);
    }
    return false;
  }

  public changeLocationTo(locationName: string) {
    if (this.gameManager) {
      return this.gameManager.changeLocationTo(locationName);
    }
    return;
  }

  /////////////////////
  //     Dialogue    //
  /////////////////////

  public async bringUpDialogue(dialogueObject: DialogueObject) {
    if (this.gameManager) {
      const [activateDialogue] = createDialogue(this.gameManager, dialogueObject);
      await activateDialogue;
    }
  }
}

export default GameActionManager;
