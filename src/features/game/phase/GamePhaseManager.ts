import { GamePhaseType } from './GamePhaseTypes';
import { gamePhaseMap } from './GamePhaseConstants';

export default class GamePhaseManager {
  private phaseStack: GamePhaseType[];
  private currentPhase: GamePhaseType;

  constructor() {
    this.currentPhase = GamePhaseType.None;
    this.phaseStack = [this.currentPhase];
  }

  public async popPhase(newPhaseParams?: any): Promise<void> {
    const prevPhase = this.phaseStack.pop()!;
    await this.phaseTransitionFrom(prevPhase, newPhaseParams);
  }

  public async pushPhase(phase: GamePhaseType, newPhaseParams?: any): Promise<void> {
    const prevPhase = this.getCurrentPhase();
    this.phaseStack.push(phase);
    await this.phaseTransitionFrom(prevPhase, newPhaseParams);
  }

  public async swapPhase(phase: GamePhaseType, newPhaseParams?: any): Promise<void> {
    const prevPhase = this.phaseStack.pop()!;
    this.phaseStack.push(phase);
    await this.phaseTransitionFrom(prevPhase, newPhaseParams);
  }

  public getCurrentPhase(): GamePhaseType {
    if (!this.phaseStack.length) {
      throw Error('No more states');
    }
    return this.phaseStack[this.phaseStack.length - 1];
  }

  private async phaseTransitionFrom(prevPhase: GamePhaseType, newPhaseParams: any) {
    console.log(this.phaseStack);
    await gamePhaseMap.get(prevPhase).deactivate();
    await gamePhaseMap.get(this.getCurrentPhase())!.activate(newPhaseParams);
  }
}
