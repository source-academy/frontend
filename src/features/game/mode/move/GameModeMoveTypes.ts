import { GameImage, screenSize } from '../../commons/CommonsTypes';

export const moveButtonXPos = screenSize.x * 0.8;

export const moveButtonStyle = {
  fontFamily: 'Helvetica',
  fontSize: '30px',
  fill: '#abd4c6'
};

export const defaultLocationImg: GameImage = {
  key: 'default-location',
  path: '../assets/defaultLocation.jpg',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

export const modeButton: GameImage = {
  key: 'loct-opt',
  path: '../assets/modeButton.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

const moveUIAssets = [defaultLocationImg];

export default moveUIAssets;
