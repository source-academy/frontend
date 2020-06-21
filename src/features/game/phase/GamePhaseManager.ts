import { GamePhaseType } from './GamePhaseTypes';
import { gamePhaseMap } from './GamePhaseConstants';

export default class GamePhaseManager {
  private phaseStack: GamePhaseType[];

  constructor() {
    this.phaseStack = [GamePhaseType.Menu];
  }

  public async popPhase(newPhaseParams?: any): Promise<void> {
    const prevPhase = this.phaseStack.pop()!;
    await gamePhaseMap.get(prevPhase).deactivate();
    await gamePhaseMap.get(this.getCurrentPhase()).reactivate(newPhaseParams);
  }

  public async pushPhase(newPhase: GamePhaseType, newPhaseParams?: any): Promise<void> {
    const prevPhase = this.getCurrentPhase();
    await gamePhaseMap.get(prevPhase).deactivate();
    await gamePhaseMap.get(newPhase).activate(newPhaseParams);
    this.phaseStack.push(newPhase);
  }

  public async swapPhase(newPhase: GamePhaseType, newPhaseParams?: any): Promise<void> {
    const prevPhase = this.phaseStack.pop()!;
    await gamePhaseMap.get(prevPhase).deactivate();
    await gamePhaseMap.get(newPhase).activate(newPhaseParams);
    this.phaseStack.push(newPhase);
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
