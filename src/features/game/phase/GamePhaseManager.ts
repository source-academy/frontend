import { GamePhaseType } from './GamePhaseTypes';
import { gamePhaseMap } from './GamePhaseConstants';

export default class GamePhaseManager {
  private phaseStack: GamePhaseType[];
  private currentPhase: GamePhaseType;

  constructor() {
    this.currentPhase = GamePhaseType.Menu;
    this.phaseStack = [this.currentPhase];
  }

  public async popPhase(newPhaseParams?: any): Promise<void> {
    const prevPhase = this.phaseStack.pop()!;
    await this.performPhaseTransition(prevPhase, newPhaseParams);
  }

  public async pushPhase(phase: GamePhaseType, newPhaseParams?: any): Promise<void> {
    const prevPhase = this.getCurrentPhase();
    this.phaseStack.push(phase);
    await this.performPhaseTransition(prevPhase, newPhaseParams);
  }

  public async swapPhase(phase: GamePhaseType, newPhaseParams?: any): Promise<void> {
    const prevPhase = this.phaseStack.pop()!;
    this.phaseStack.push(phase);
    await this.performPhaseTransition(prevPhase, newPhaseParams);
  }

  private async performPhaseTransition(prevPhase: GamePhaseType, newPhaseParams: any) {
    if (prevPhase) await gamePhaseMap.get(prevPhase).deactivate();
    await gamePhaseMap.get(this.getCurrentPhase()).activate(newPhaseParams);
  }

  private getCurrentPhase(): GamePhaseType {
    if (!this.phaseStack.length) {
      throw Error('No more states');
    }
    return this.phaseStack[this.phaseStack.length - 1];
  }
}
