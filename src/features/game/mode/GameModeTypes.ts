import { screenSize } from '../commons/CommonConstants';
import { GamePhaseType } from '../phase/GamePhaseTypes';
import { Color } from '../utils/StyleUtils';

export const backText = 'Back';
export const backTextYPos = screenSize.y * 0.012;

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

export const backButtonStyle = {
  fontFamily: 'Helvetica',
  fontSize: '25px',
  fill: Color.darkBlue
};
