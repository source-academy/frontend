import { ImageAsset } from '../../game/commons/CommonsTypes';

export const studentRoomImg: ImageAsset = {
  key: 'student-room',
  path:
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/yourRoom-dim/normal.png'
};

export const mainMenuOptBanner: ImageAsset = {
  key: 'menu-option',
  path: '../assets/menuOption.png'
};

export const shortButton: ImageAsset = {
  key: 'short-button',
  path: '../assets/shortButton.png'
};

const storySimulatorAssets = [studentRoomImg, mainMenuOptBanner, shortButton];

export default storySimulatorAssets;
