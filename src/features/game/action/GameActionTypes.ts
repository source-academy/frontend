import { ItemId, TrackInteraction } from '../commons/CommonTypes';
import { GameStateStorage } from '../state/GameStateTypes';

export enum GameActionType {
  MoveCharacter = 'MoveCharacter',
  UpdateCharacter = 'UpdateCharacter',
  ObtainCollectible = 'ObtainCollectible',
  CompleteObjective = 'CompleteObjective',
  LocationChange = 'LocationChange',
  AddItem = 'AddItem',
  RemoveItem = 'RemoveItem',
  BringUpDialogue = 'BringUpDialogue',
  ChangeBackground = 'ChangeBackground',
  RemoveLocationMode = 'RemoveLocationMode',
  AddLocationMode = 'AddLocationMode',
  AddPopup = 'AddPopup',
  MakeObjectBlink = 'MakeObjectBlink',
  MakeObjectGlow = 'MakeObjectGlow',
  PlayBGM = 'PlayBGM',
  PlaySFX = 'PlaySFX'
}

export interface IGameActionable {
  actionIds?: ItemId[];
}

export type ActionCondition = {
  state: GameStateStorage;
  conditionParams: any;
  boolean: boolean;
};

export type GameAction = TrackInteraction & {
  actionType: GameActionType;
  actionParams: any;
  actionConditions: ActionCondition[];
  isRepeatable: boolean;
};
