import { GameStateStorage } from '../state/GameStateTypes';

export enum GameActionType {
  MoveCharacter = 'MoveCharacter',
  UpdateCharacter = 'UpdateCharacter',
  Collectible = 'Collectible',
  UpdateChecklist = 'UpdateChecklist',
  LocationChange = 'LocationChange',
  AddItem = 'AddItem',
  RemoveItem = 'RemoveItem',
  BringUpDialogue = 'BringUpDialogue',
  ChangeBackground = 'ChangeBackground'
}

export interface IGameActionable {
  actions?: GameAction[];
}

export type ActionCondition = {
  state: GameStateStorage;
  conditionParams: any;
  boolean?: boolean;
};

export type GameAction = {
  actionType: GameActionType;
  actionParams: any;
  actionConditions?: ActionCondition[];
};

export function createGameAction(
  actionType: GameActionType,
  actionParams: any,
  actionConditions?: ActionCondition[]
): GameAction {
  return {
    actionType: actionType,
    actionParams,
    actionConditions: actionConditions || []
  };
}

export function createCondition(state: GameStateStorage, conditionParams: any, boolean = true) {
  return {
    state,
    conditionParams,
    boolean
  };
}
