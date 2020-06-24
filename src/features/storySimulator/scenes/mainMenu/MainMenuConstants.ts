import { screenSize } from 'src/features/game/commons/CommonConstants';
import { Color } from 'src/features/game/utils/StyleUtils';

export const maxOptButtonsRow = 3;
export const optButtonsXSpace = screenSize.x * 0.9;
export const optButtonsYSpace = screenSize.y * 0.5;

export const mainMenuOptStyle = {
  fontFamily: 'Helvetica',
  fontSize: '35px',
  fill: Color.darkBlue
};
