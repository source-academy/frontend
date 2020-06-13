import GameManager from '../../../pages/academy/game/subcomponents/GameManager';
import { GameMode } from 'src/features/game/mode/GameModeTypes';
import { DialogueObject } from 'src/features/game/dialogue/DialogueTypes';
import { createDialogue } from 'src/features/game/dialogue/DialogueRenderer';
import { SpeakerDetail } from 'src/features/game/dialogue/DialogueTypes';
import { GameLocationAttr } from '../location/GameMapTypes';

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

  public getGameManager(): GameManager {
    if (!this.gameManager) {
      throw new Error('Game Manager not found');
    }
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
      this.gameManager.modeManager.addMode(mode, locationName);
      this.gameManager.stateManager.addLocationMode(currLocName, locationName, mode);
    }
  }

  public removeLocationMode(currLocName: string, locationName: string, mode: GameMode): void {
    if (this.gameManager) {
      this.gameManager.modeManager.removeMode(mode, locationName);
      this.gameManager.stateManager.removeLocationMode(currLocName, locationName, mode);
    }
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

  public hasLocationUpdate(locationName: string, mode?: GameMode): boolean | undefined {
    if (this.gameManager) {
      return this.gameManager.stateManager.hasLocationUpdate(locationName, mode);
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
  //Game Interaction //
  /////////////////////

  public hasTriggeredInteraction(id: string): boolean | undefined {
    if (this.gameManager) {
      return this.gameManager.stateManager.hasTriggeredInteraction(id);
    }
    return undefined;
  }

  public triggerInteraction(id: string): void {
    if (this.gameManager) {
      return this.gameManager.stateManager.triggerInteraction(id);
    }
    return undefined;
  }

  /////////////////////
  //    Game Attr    //
  /////////////////////

  public getLocationAttr(attr: GameLocationAttr, locationName: string) {
    if (this.gameManager) {
      return this.gameManager.stateManager.getLocationAttr(attr, locationName);
    }
    return undefined;
  }

  public addLocationAttr(
    attr: GameLocationAttr,
    currLocName: string,
    locationName: string,
    attrElem: string
  ): void {
    if (this.gameManager) {
      return this.gameManager.stateManager.addLocationAttr(
        attr,
        currLocName,
        locationName,
        attrElem
      );
    }
    return;
  }

  public removeLocationAttr(
    attr: GameLocationAttr,
    currLocName: string,
    locationName: string,
    attrElem: string
  ): void {
    if (this.gameManager) {
      return this.gameManager.stateManager.removeLocationAttr(
        attr,
        currLocName,
        locationName,
        attrElem
      );
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

  public async changeCharacter(speakerDetail: SpeakerDetail) {
    if (this.gameManager) {
      // this.characterManager.changeCharacter(speakerDetail);
    }
  }
}

export default GameActionManager;
