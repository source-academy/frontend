import { Constants } from '../commons/CommonConstants';
import { IGameUI } from '../commons/CommonTypes';
import GameInputManager from '../input/GameInputManager';
import { mandatory } from '../utils/GameUtils';
import { GamePhaseType } from './GamePhaseTypes';

export default class GamePhaseManager {
  public phaseMap: Map<GamePhaseType, IGameUI>;
  private phaseStack: GamePhaseType[];
  private inputManager: GameInputManager | undefined;
  private phaseTransitionCallback: (newPhase: GamePhaseType) => void;

  constructor() {
    this.phaseStack = [GamePhaseType.None];
    this.phaseMap = new Map<GamePhaseType, IGameUI>();
    this.phaseTransitionCallback = Constants.nullFunction;
  }

  public initialise(phaseMap: Map<GamePhaseType, IGameUI>, inputManager: GameInputManager) {
    this.phaseMap = phaseMap;
    this.inputManager = inputManager;
  }

  public setCallback(fn: (newPhase: GamePhaseType) => void) {
    this.phaseTransitionCallback = fn;
  }

  public async popPhase(): Promise<void> {
    const prevPhase = this.phaseStack.pop()!;
    await this.executePhaseTransition(prevPhase, this.getCurrentPhase());
  }

  public async pushPhase(newPhase: GamePhaseType): Promise<void> {
    const prevPhase = this.getCurrentPhase();
    if (newPhase === prevPhase || this.isCurrentPhase(GamePhaseType.EscapeMenu)) return;
    this.phaseStack.push(newPhase);
    await this.executePhaseTransition(prevPhase, newPhase);
  }

  public async swapPhase(newPhase: GamePhaseType): Promise<void> {
    const prevPhase = this.getCurrentPhase();
    if (newPhase === prevPhase || this.isCurrentPhase(GamePhaseType.EscapeMenu)) return;
    this.phaseStack.pop();
    this.phaseStack.push(newPhase);
    await this.executePhaseTransition(prevPhase, newPhase);
  }

  private async executePhaseTransition(prevPhase: GamePhaseType, newPhase: GamePhaseType) {
    await this.phaseTransitionCallback(newPhase);

    this.getInputManager().enableKeyboardInput(false);
    this.getInputManager().enableMouseInput(false);
    await this.phaseMap.get(prevPhase)!.deactivateUI();
    await this.phaseMap.get(newPhase)!.activateUI();
    this.getInputManager().enableMouseInput(true);
    this.getInputManager().enableKeyboardInput(true);
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

  public getInputManager = () => mandatory(this.inputManager);
}
