import { ImageAsset } from '../../game/commons/CommonsTypes';

export const studentRoomImg: ImageAsset = {
  key: 'student-room',
  path:
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/deathCube_ext/shields-down.png'
};

export const mainMenuOptBanner: ImageAsset = {
  key: 'menu-option',
  path: '../assets/menuOption.png'
};

export const shortButton: ImageAsset = {
  key: 'short-button',
  path: '../assets/shortButton.png'
};

export const invertedButton: ImageAsset = {
  key: 'inverted-button',
  path: '../assets/invertedColorButton.png'
};

export const blueUnderlay: ImageAsset = {
  key: 'blue-underlay',
  path: '../assets/blueUnderlay.png'
};
const storySimulatorAssets = [
  studentRoomImg,
  mainMenuOptBanner,
  shortButton,
  invertedButton,
  blueUnderlay
];

export default storySimulatorAssets;
