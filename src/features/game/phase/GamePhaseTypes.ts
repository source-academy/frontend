export enum GamePhaseType {
  Move = 'Move',
  Explore = 'Explore',
  Talk = 'Talk',
  Menu = 'Menu',
  Dialogue = 'Dialogue',
  Popup = 'Popup',
  Cutscene = 'Cutscene',
  EscapeMenu = 'EscapeMenu',
  None = 'None',
  Notification = 'Notification'
}

export type GamePhase = {
  type: GamePhaseType;
  activate: Function;
  deactivate: Function;
};
