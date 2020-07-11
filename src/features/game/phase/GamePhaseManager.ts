import _ from 'lodash';

import { GamePhaseType } from './GamePhaseTypes';
import { createGamePhases } from './GamePhaseConstants';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { IGameUI } from '../commons/CommonTypes';

export default class GamePhaseManager {
  private phaseStack: GamePhaseType[];
  public phaseMap: Map<GamePhaseType, IGameUI>;

  constructor() {
    this.phaseStack = [GamePhaseType.None];
    this.phaseMap = new Map<GamePhaseType, IGameUI>();
  }

  public initialise() {
    this.phaseMap = createGamePhases();
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
    // Transition to the next scene if possible
    if (
      _.isEqual(this.phaseStack, [GamePhaseType.Menu]) &&
      GameGlobalAPI.getInstance().isAllComplete()
    ) {
      await this.phaseMap.get(prevPhase)!.deactivateUI();
      await GameGlobalAPI.getInstance().getGameManager().checkpointTransition();
      return;
    }
    GameGlobalAPI.getInstance().enableKeyboardInput(false);
    GameGlobalAPI.getInstance().enableMouseInput(false);
    await this.phaseMap.get(prevPhase)!.deactivateUI();
    await this.phaseMap.get(newPhase)!.activateUI();
    GameGlobalAPI.getInstance().enableMouseInput(true);
    GameGlobalAPI.getInstance().enableKeyboardInput(true);
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
