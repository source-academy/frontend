import { GameStateStorage } from '../state/GameStateTypes';

export enum GameActionType {
  MoveCharacter,
  UpdateCharacter,
  Collectible,
  UpdateChecklist,
  LocationChange,
  AddItem,
  RemoveItem,
  BringUpDialogue,
  ChangeBackground,
  RemoveLocationMode,
  AddLocationMode
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
