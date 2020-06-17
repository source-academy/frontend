import { screenSize } from '../commons/CommonConstants';

export const backText = 'Back';
export const backTextYPos = screenSize.y * 0.012;

export enum GameMode {
  Move = 'Move',
  Explore = 'Explore',
  Talk = 'Talk',
  Menu = 'Menu'
}

export enum GamePhase {
  Standard,
  Dialogue
}

export const backButtonStyle = {
  fontFamily: 'Helvetica',
  fontSize: '25px',
  fill: '#0d2440'
};
