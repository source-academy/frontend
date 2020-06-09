import { GameImage, screenSize, longButton } from '../../commons/CommonsTypes';

export const moveButtonXPos = screenSize.x * 0.75;

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
  key: 'default-location',
  path: '../assets/defaultLocation.jpg',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

const moveUIAssets = [defaultLocationImg, longButton];

export default moveUIAssets;
