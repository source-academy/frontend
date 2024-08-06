import { ItemId, TrackInteraction } from '../commons/CommonTypes';
import { GameStateStorage } from '../state/GameStateTypes';

export enum GameActionType {
  MoveCharacter = 'MoveCharacter',
  UpdateCharacter = 'UpdateCharacter',
  ObtainCollectible = 'ObtainCollectible',
  CompleteObjective = 'CompleteObjective',
  CompleteTask = 'CompleteTask',
  ShowTask = 'ShowTask',
  PreviewLocation = 'PreviewLocation',
  AddItem = 'AddItem',
  RemoveItem = 'RemoveItem',
  ShowDialogue = 'ShowDialogue',
  ChangeBackground = 'ChangeBackground',
  StartAnimation = 'StartAnimation',
  StopAnimation = 'StopAnimation',
  RemoveLocationMode = 'RemoveLocationMode',
  AddLocationMode = 'AddLocationMode',
  AddPopup = 'AddPopup',
  MakeObjectBlink = 'MakeObjectBlink',
  MakeObjectGlow = 'MakeObjectGlow',
  PlayBGM = 'PlayBGM',
  PlaySFX = 'PlaySFX',
  ShowObjectLayer = 'ShowObjectLayer',
  NavigateToAssessment = 'NavigateToAssessment',
  UpdateAssessmentStatus = 'UpdateAssessmentStatus',
  Delay = 'Delay',
  ShowQuiz = 'ShowQuiz'
}

/**
 * Interface for entities which can contain actions, including locations, objects, etc.
 */
export interface IGameActionable {
  actionIds?: ItemId[];
}
/**
 * Condition object which encapsulates data about an action condition,
 * which is the condition that needs to be satisfied before an action
 * can be played
 *
 * @prop {GameStateStorage} state - the game state which needs to be checked to determine the truthiness of the condition
 * @prop {any} conditionParams - an object encapsulating more information about the condition,
 *                               such as itemId that needs to be checked for existence to satisfy the condition
 * @prop {boolean} boolean - whether the condition needs to match "true" or "false" before it is satisfied
 */
export type ActionCondition = {
  state: GameStateStorage;
  conditionParams: any;
  boolean: boolean;
};

/**
 * Action object which encapsulates data about an action,
 * that can be performed.
 *
 * See Command Pattern/Redux actions.
 *
 * @prop {GameActionType} actionType - the type of action that will be performed
 * @prop {any} actionParams - an object containing information about the parameters of the action such as which entity ID to perform this action on
 * @prop {Array<ActionCondition>} actionConditions - a list of conditions that need to be satisfied in order for the action to be executed
 * @prop {isRepeatable} boolean - whether or not the action can be performed again when it is triggerd.
 */
export type GameAction = TrackInteraction & {
  actionType: GameActionType;
  actionParams: any;
  actionConditions: ActionCondition[];
  isRepeatable: boolean;
};
