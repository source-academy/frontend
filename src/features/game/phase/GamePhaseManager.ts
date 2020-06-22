import { GamePhaseType } from './GamePhaseTypes';
import { gamePhaseMap } from './GamePhaseConstants';
import GameActionManager from '../action/GameActionManager';

export default class GamePhaseManager {
  private phaseStack: GamePhaseType[];

  constructor() {
    this.phaseStack = [GamePhaseType.None];
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
    GameActionManager.getInstance().enableKeyboardInput(false);
    await gamePhaseMap.get(prevPhase).deactivate();
    await gamePhaseMap.get(newPhase).activate();
    GameActionManager.getInstance().enableKeyboardInput(true);
  }

  public isCurrentPhase(phase: GamePhaseType): boolean {
    return this.getCurrentPhase() === phase;
  }

  private getCurrentPhase(): GamePhaseType {
    if (!this.phaseStack.length) {
      this.phaseStack = [GamePhaseType.None];
    }
    return this.phaseStack[this.phaseStack.length - 1];
  }
}
