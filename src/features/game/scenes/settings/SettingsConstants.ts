import { screenSize } from '../../commons/CommonConstants';
import { Color } from '../../utils/StyleUtils';

export const volumeOptionTextAnchorX = 1;
export const volumeOptionTextAnchorY = 0.25;
export const volumeContainerOptions = ['0', '0.50', '1.00', '1.50', '2.00'];
export const volumeDefaultOpt = 2;
export const volumeOptionXSpace = screenSize.x * 0.5;
export const volumeContainerXPos = 0;
export const volumeContainerYPos = screenSize.y * 0.3;

export const applySettingsAnchorX = 0.33;
export const applySettingsAnchorY = 0.85;

export const volumeOptionTextStyle = {
  fontFamily: 'Helvetica',
  fontSize: '25px',
  fill: Color.lightBlue,
  align: 'center'
};

export const optionHeaderTextStyle = {
  fontFamily: 'Helvetica',
  fontSize: '45px',
  fill: Color.lightBlue,
  align: 'center'
};

export const applySettingsTextStyle = {
  fontFamily: 'Helvetica',
  fontSize: '30px',
  fill: Color.lightBlue,
  align: 'center'
};
