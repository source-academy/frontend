import { GameImage, screenSize, longButton } from '../../commons/CommonsTypes';

export const moveButtonXPos = screenSize.x * 0.75;
export const previewXPos = screenSize.x * 0.3;
export const previewScale = 0.8;
export const cropPos = [
  530 * previewScale,
  225 * previewScale,
  905 / previewScale,
  605 / previewScale
];

export const moveEntryTweenProps = {
  y: -screenSize.y * 0.01,
  duration: 800,
  ease: 'Power2'
};

export const moveExitTweenProps = {
  y: -screenSize.y * 0.4,
  duration: 500,
  ease: 'Power2'
};

export const moveButtonStyle = {
  fontFamily: 'Helvetica',
  fontSize: '35px',
  fill: '#abd4c6'
};

export const defaultLocationImg: GameImage = {
  key: 'loc-default',
  path: '../assets/defaultLocation.jpg',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

export const locationPreviewFrame: GameImage = {
  key: 'loc-preview-frame',
  path: '../assets/locationPreviewFrame.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

export const locationPreviewFill: GameImage = {
  key: 'loc-preview-fill',
  path: '../assets/locationPreviewFill.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

const moveUIAssets = [defaultLocationImg, longButton, locationPreviewFrame, locationPreviewFill];

export default moveUIAssets;
