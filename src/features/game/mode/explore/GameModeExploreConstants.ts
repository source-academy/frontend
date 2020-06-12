import { screenSize, GameImage } from '../../commons/CommonsTypes';

export const magnifyingGlass = 'url(../assets/magnifying_glass.ico), pointer';

export const defaultLocationImg: GameImage = {
  key: 'loc-default',
  path: '../assets/defaultLocation.jpg',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

const exploreUIAssets = [defaultLocationImg];

export default exploreUIAssets;
