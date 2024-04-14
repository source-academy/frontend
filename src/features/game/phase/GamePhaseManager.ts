import { Constants } from '../commons/CommonConstants';
import { IGameUI } from '../commons/CommonTypes';
import GameInputManager from '../input/GameInputManager';
import { GamePhaseType, GameTerminalPhaseType } from './GamePhaseTypes';

/**
 * State machine in charge of keeping track
 * of phases in the game, and is in charge of making phase
 * transitions from one phase to another.
 *
 * It keeps phases in a stack to keep track of states
 * that have been previously visited.
 *
 * For more, search for FSM (finite state machine).
 */
export default class GamePhaseManager {
  public phaseMap: Map<GamePhaseType, IGameUI>;
  private phaseStack: GamePhaseType[];
  private inputManager: GameInputManager;
  private interruptCheckCallback: (prevPhase: GamePhaseType, newPhase: GamePhaseType) => boolean;
  private interruptTransitionCallback: (
    prevPhase: GamePhaseType,
    newPhase: GamePhaseType
  ) => Promise<void>;
  private transitionCallback: (prevPhase: GamePhaseType, newPhase: GamePhaseType) => void;

  constructor(phaseMap: Map<GamePhaseType, IGameUI>, inputManager: GameInputManager) {
    this.phaseStack = [GamePhaseType.None];
    this.phaseMap = phaseMap;
    this.interruptCheckCallback = () => false;
    this.interruptTransitionCallback = async () => Constants.nullFunction();
    this.transitionCallback = Constants.nullFunction;
    this.inputManager = inputManager;
  }

  /**
   * Add an additional phase into the phase map.
   *
   * @param gamePhaseType type of phase
   * @param gameUI gameUI to be activated at the phase
   */
  public addPhaseToMap(gamePhaseType: GamePhaseType, gameUI: IGameUI) {
    this.phaseMap.set(gamePhaseType, gameUI);
  }

  /**
   * Set the interrupt check of the phase manager. Interrupt check is called
   * to determine whether interrupt callback is called. The function
   * signature must return a boolean.
   *
   * If the boolean returned is true, interrupt callback will be executed.
   *
   * @param fn callback
   */
  public setInterruptCheckCallback(
    fn: (prevPhase: GamePhaseType, newPhase: GamePhaseType) => boolean
  ) {
    this.interruptCheckCallback = fn;
  }

  /**
   * Set the interrupt callback of the phase manager.
   * The callback will be executed before every phase transition.
   *
   * Will use the interruptCheck function to determine whether this function
   * is executed. If executed, phase manager will not transition to the
   * new phase i.e. interrupt the phase transition.
   *
   * @param fn callback
   */
  public setInterruptCallback(
    fn: (prevPhase: GamePhaseType, newPhase: GamePhaseType) => Promise<void>
  ) {
    this.interruptTransitionCallback = fn;
  }

  /**
   * Set the interrupt callback of the phase manager. The callback will be executed
   * before every phase transition.
   *
   * @param fn callback
   */
  public setCallback(fn: (prevPhase: GamePhaseType, newPhase: GamePhaseType) => void) {
    this.transitionCallback = fn;
  }

  /**
   * Pop the current phase, and revert to the previous phase.
   * The current phase will no longer be saved on the phase stack.
   */
  public async popPhase(): Promise<void> {
    const prevPhase = this.phaseStack.pop()!;
    await this.executePhaseTransition(prevPhase, this.getCurrentPhase());
  }

  /**
   * Push a new phase; will cause previous phase to transition out
   * and transition in the new phase. Previous phase will be stored within
   * the phase stack.
   *
   * @param newPhase phase to transition to
   */
  public async pushPhase(newPhase: GamePhaseType): Promise<void> {
    const prevPhase = this.getCurrentPhase();
    if (newPhase === prevPhase) return;
    this.phaseStack.push(newPhase);
    await this.executePhaseTransition(prevPhase, newPhase);
  }

  /**
   * Swap the previous phase to another phase. Previous phase will no
   * longer be saved on the phase stack.
   *
   * @param newPhase phase to swap to
   */
  public async swapPhase(newPhase: GamePhaseType): Promise<void> {
    const prevPhase = this.getCurrentPhase();
    if (newPhase === prevPhase) return;
    this.phaseStack.pop();
    this.phaseStack.push(newPhase);
    await this.executePhaseTransition(prevPhase, newPhase);
  }

  /**
   * Handles the transition from one phase to another,
   * by deactivating the previous phase followed by activating the new phase.
   *
   * During transition, all inputs are disabled (mouse and keyboard) to prevent
   * user input which may mutate the phase stack during the transition.
   *
   * Mutating the stack during the transition leads to phaseStack not matching
   * with what is shown on user screen; which leads to undefined behaviour.
   *
   * @param prevPhase previous phase to deactivate
   * @param newPhase new phase to activate
   */
  private async executePhaseTransition(prevPhase: GamePhaseType, newPhase: GamePhaseType) {
    // Disable inputs to avoid user input mutating the stack
    this.inputManager.enableKeyboardInput(false);
    this.inputManager.enableMouseInput(false);
    await this.phaseMap.get(prevPhase)!.deactivateUI();

    if (this.interruptCheckCallback(prevPhase, newPhase)) {
      // Enable input in case interrupt transition callback needs it
      this.inputManager.enableMouseInput(true);
      this.inputManager.enableKeyboardInput(true);
      await this.interruptTransitionCallback(prevPhase, newPhase);
      return;
    }

    this.transitionCallback(prevPhase, newPhase);

    // Transition to new phase
    await this.phaseMap.get(newPhase)!.activateUI();
    this.inputManager.enableMouseInput(true);
    this.inputManager.enableKeyboardInput(true);
  }

  /**
   * Checks whether the current phase is equal to the inquired phase
   *
   * @param phase phase to compare to
   * @returns {boolean}
   */
  public isCurrentPhase(phase: GamePhaseType): boolean {
    return this.getCurrentPhase() === phase;
  }

  /**
   * Checks whether the current phase is a terminal phase.
   *
   * @returns {boolean}
   */
  public isCurrentPhaseTerminal(): boolean {
    return Object.values(GameTerminalPhaseType).includes(
      this.getCurrentPhase() as unknown as GameTerminalPhaseType
    );
  }

  /**
   * Returns the current phase.
   * If there is no phase, by default we return GamePhaseType.None.
   *
   * @return {GamePhaseType}
   */
  public getCurrentPhase(): GamePhaseType {
    if (!this.phaseStack.length) {
      this.phaseStack = [GamePhaseType.None];
    }
    return this.phaseStack[this.phaseStack.length - 1];
  }
}
