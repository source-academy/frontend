import { GameStateStorage } from '../state/GameStateTypes';
import { ItemId, TrackInteraction } from '../commons/CommonsTypes';

export enum GameActionType {
  MoveCharacter = 'MoveCharacter',
  UpdateCharacter = 'UpdateCharacter',
  Collectible = 'Collectible',
  UpdateChecklist = 'UpdateChecklist',
  LocationChange = 'LocationChange',
  AddItem = 'AddItem',
  RemoveItem = 'RemoveItem',
  BringUpDialogue = 'BringUpDialogue',
  ChangeBackground = 'ChangeBackground',
  RemoveLocationMode = 'RemoveLocationMode',
  AddLocationMode = 'AddLocationMode',
  AddPopup = 'AddPopup'
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
