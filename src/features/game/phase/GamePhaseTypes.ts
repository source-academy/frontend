export enum GamePhaseType {
  Move = 'Move',
  Explore = 'Explore',
  Talk = 'Talk',
  Menu = 'Menu',
  EscapeMenu = 'EscapeMenu',
  None = 'None',
  Sequence = 'Sequence'
}

export type GamePhase = {
  type: GamePhaseType;
  activate: (phaseParams?: any) => void | Promise<void>;
  deactivate: () => void | Promise<void>;
};
