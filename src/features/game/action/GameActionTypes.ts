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

export const stringToActionType = {
  moveCharacter: GameActionType.MoveCharacter,
  updateCharacter: GameActionType.UpdateCharacter,
  collectible: GameActionType.Collectible,
  updateChecklist: GameActionType.UpdateChecklist,
  locationChange: GameActionType.LocationChange,
  addItem: GameActionType.AddItem,
  removeItem: GameActionType.RemoveItem,
  changeBackground: GameActionType.ChangeBackground
};

export interface IGameActionable {
  actions: GameAction[];
}

export type ActionCondition = {
  state: string;
  conditionParams: any;
  boolean?: boolean;
};

export type GameAction = {
  actionType: GameActionType;
  actionParams: any;
  conditionals?: ActionCondition[];
};

export function createGameAction(
  action: string,
  actionParams: any,
  actionCondition?: ActionCondition[]
) {
  return {
    actionType: stringToActionType[action],
    actionParams,
    actionCondition: actionCondition || []
  };
}
