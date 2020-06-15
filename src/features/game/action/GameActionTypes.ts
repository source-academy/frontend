export enum GameActionType {
  MoveCharacter = 'MoveCharacter',
  UpdateCharacter = 'UpdateCharacter',
  Collectible = 'Collectible',
  ObtainObject = 'ObtainObject',
  LocationChange = 'LocationChange'
}

export const stringToActionType = {
  moveCharacter: GameActionType.MoveCharacter,
  updateCharacter: GameActionType.UpdateCharacter,
  collectible: GameActionType.Collectible,
  obtainObject: GameActionType.ObtainObject,
  locationChange: GameActionType.LocationChange
};

export type GameAction = {
  actionType: GameActionType;
  actionParams: any;
};

export function createGameAction(action: string, actionParams: any) {
  return {
    actionType: stringToActionType[action],
    actionParams
  };
}
