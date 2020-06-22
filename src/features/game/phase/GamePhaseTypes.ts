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
  Notification = 'Notification',
  Action = 'Action'
}

export type GamePhase = {
  type: GamePhaseType;
  activate: (phaseParams?: any) => void | Promise<void>;
  reactivate: () => void | Promise<void>;
  deactivate: () => void | Promise<void>;
};
