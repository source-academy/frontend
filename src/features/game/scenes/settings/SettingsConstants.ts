import { screenSize, screenCenter } from '../../commons/CommonConstants';
import { Color } from '../../utils/StyleUtils';

export const volumeOptionTextAnchorX = 0.5;
export const volumeOptionTextAnchorY = 0.25;
export const volumeContainerOptions = ['0', '0.50', '1.00', '1.50', '2.00'];
export const volumeOptionXSpace = screenSize.x * 0.5;
export const volumeContainerXPos = 0;
export const volumeContainerYPos = screenCenter.y;
export const volumeOptionTextStyle = {
  fontFamily: 'Helvetica',
  fontSize: '25px',
  fill: Color.lightBlue,
  align: 'center'
};
