import { Constants } from '../commons/CommonConstants';

enum FsmStackAction {
  Pop = 'pop',
  Swap = 'swap'
}

type FsmState = string;

type BehaviourPredicate = () => boolean;

type FsmBehaviour = {
  name: FsmState;
  stackAction: FsmStackAction;
  possibleTransitions: Map<FsmState, BehaviourPredicate>;
  entryTransition: () => Promise<void>;
  exitTransition: () => Promise<void>;
};

class FsmBrain {
  private behaviours: Map<FsmState, FsmBehaviour>;
  private stateStack: Array<FsmState>;
  private isTransitioning: boolean;
  private defaultState: FsmState;
  private changeLimit: number;

  constructor(behaviours: Map<FsmState, FsmBehaviour>, defaultState: FsmState, changeLimit = 0.01) {
    this.behaviours = behaviours;
    this.stateStack = new Array<FsmState>();
    this.isTransitioning = false;
    this.defaultState = defaultState;
    this.changeLimit = changeLimit;

    // Start with default state
    this.transitionTo(this.behaviours.get(this.defaultState)!);
  }

  public update() {
    if (this.isTransitioning || Math.random() > this.changeLimit) return;

    const currentState = this.getCurrentState() || Constants.nullInteractionId;
    const currentBehaviour = this.behaviours.get(currentState);

    if (!currentBehaviour) {
      // Invalid current behaviour, transition to default state
      this.transitionTo(this.behaviours.get(this.defaultState)!);
      return;
    }

    // Check possible transition, and transition into it if the predicate returns true
    for (const state in currentBehaviour.possibleTransitions.keys()) {
      const predicate = currentBehaviour.possibleTransitions.get(state)!;
      if (predicate()) {
        this.transitionTo(this.behaviours.get(state)!, currentBehaviour);
        return;
      }
    }
  }

  private async transitionTo(newBehaviour: FsmBehaviour, oldBehaviour?: FsmBehaviour) {
    this.isTransitioning = true;

    // Handle stack action
    if (newBehaviour.stackAction === FsmStackAction.Pop) {
      this.popState();
    } else if (newBehaviour.stackAction === FsmStackAction.Swap) {
      this.swapState(newBehaviour.name);
    }

    // Transition between behaviours
    if (oldBehaviour) await oldBehaviour.exitTransition();
    await newBehaviour.entryTransition();

    this.isTransitioning = false;
  }

  private popState() {
    return this.stateStack.pop();
  }

  private swapState(newState: FsmState) {
    this.stateStack.pop();
    this.stateStack.push(newState);
  }

  public getCurrentState() {
    return this.stateStack.length > 0 ? this.stateStack[this.stateStack.length - 1] : null;
  }
}

export class Pet {
  private fsmBrain: FsmBrain;

  constructor(
    scene: Phaser.Scene,
    behaviours: Map<FsmState, FsmBehaviour>,
    defaultState: FsmState,
    x: number,
    y: number
  ) {
    this.fsmBrain = new FsmBrain(behaviours, defaultState);
  }

  public getBrain() {
    return this.fsmBrain;
  }
}
