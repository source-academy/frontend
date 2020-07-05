import { GamePhaseType, GamePhase } from './GamePhaseTypes';
import GameManager from '../scenes/gameManager/GameManager';
import { createGamePhaseMap } from './GamePhaseConstants';

export default class GamePhaseManager {
  private phaseStack: GamePhaseType[];
  private gameManager: GameManager;
  private gamePhaseMap: Map<string, GamePhase>;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
    this.phaseStack = [GamePhaseType.None];
    this.gamePhaseMap = createGamePhaseMap(gameManager);
  }

  public async popPhase(): Promise<void> {
    const prevPhase = this.phaseStack.pop()!;
    await this.executePhaseTransition(prevPhase, this.getCurrentPhase());
  }

  public async pushPhase(newPhase: GamePhaseType): Promise<void> {
    const prevPhase = this.getCurrentPhase();
    if (newPhase === prevPhase) return;
    this.phaseStack.push(newPhase);
    await this.executePhaseTransition(prevPhase, newPhase);
  }

  public async swapPhase(newPhase: GamePhaseType): Promise<void> {
    const prevPhase = this.getCurrentPhase();
    if (newPhase === prevPhase) return;
    this.phaseStack.pop();
    this.phaseStack.push(newPhase);
    await this.executePhaseTransition(prevPhase, newPhase);
  }

  public async executePhaseTransition(prevPhase: GamePhaseType, newPhase: GamePhaseType) {
    this.gameManager.input.keyboard.enabled = false;
    await this.gamePhaseMap.get(prevPhase)!.deactivate();
    await this.gamePhaseMap.get(newPhase)!.activate();
    this.gameManager.input.keyboard.enabled = true;

    // Transition to the next scene if possible
    this.gameManager.checkpointTransition();
  }

  public isCurrentPhase(phase: GamePhaseType): boolean {
    return this.getCurrentPhase() === phase;
  }

  public getCurrentPhase(): GamePhaseType {
    if (!this.phaseStack.length) {
      this.phaseStack = [GamePhaseType.None];
    }
    return this.phaseStack[this.phaseStack.length - 1];
  }
}
