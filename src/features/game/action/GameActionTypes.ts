import { GameStateStorage } from '../state/GameStateTypes';
import { ItemId, TrackInteraction } from '../commons/CommonsTypes';

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
  actionIds?: ItemId[];
}

export type ActionCondition = {
  state: GameStateStorage;
  conditionParams: any;
  boolean?: boolean;
};

export type GameAction = TrackInteraction & {
  actionType: GameActionType;
  actionParams: any;
  actionConditions?: ActionCondition[];
};

export function createCondition(state: GameStateStorage, conditionParams: any, boolean = true) {
  return {
    state,
    conditionParams,
    boolean
  };
}
