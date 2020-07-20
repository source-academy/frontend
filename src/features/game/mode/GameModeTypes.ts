import { GamePhaseType } from '../phase/GamePhaseTypes';

export enum GameMode {
  Move = 'Move',
  Explore = 'Explore',
  Talk = 'Talk',
  Menu = 'Menu'
}

export const gameModeToPhase = {
  Move: GamePhaseType.Move,
  Explore: GamePhaseType.Explore,
  Talk: GamePhaseType.Talk,
  Menu: GamePhaseType.Menu
};
