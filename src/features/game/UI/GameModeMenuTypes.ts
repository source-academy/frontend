import { GameImage, screenSize } from '../commons/CommonsTypes';

export const modeButtonStyle = {
  fontFamily: 'Helvetica',
  fontSize: '45px',
  fill: '#abd4c6'
};

export const modeMenuBanner: GameImage = {
  key: 'mode-banner',
  path: '../assets/modeMenuBanner.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

export const modeButton: GameImage = {
  key: 'mode-button',
  path: '../assets/modeButton.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

const modeUIAssets = [modeMenuBanner, modeButton];

export default modeUIAssets;
