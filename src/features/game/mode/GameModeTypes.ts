import { GamePhaseType } from '../phase/GamePhaseTypes';

export enum GameMode {
  Explore = 'Explore',
  Talk = 'Talk'
}

export const gameModeToPhase = {
  Explore: GamePhaseType.Explore,
  Talk: GamePhaseType.Talk
};
