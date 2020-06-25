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

export const topButton: ImageAsset = {
  key: 'top-button',
  path: '../assets/topButton.png'
};

export const colorIcon: ImageAsset = {
  key: 'color-icon',
  path: '../assets/colorIcon.png'
};

export const imageIcon: ImageAsset = {
  key: 'image-icon',
  path: '../assets/imageIcon.png'
};

export const bboxIcon: ImageAsset = {
  key: 'bbox-icon',
  path: '../assets/bboxIcon.png'
};

export const handIcon: ImageAsset = {
  key: 'hand-icon',
  path: '../assets/handIcon.png'
};

export const listIcon: ImageAsset = {
  key: 'list-icon',
  path: '../assets/listIcon.png'
};

export const iconBg: ImageAsset = {
  key: 'icon-bg',
  path: '../assets/modeIconBg.png'
};

const storySimulatorAssets = [
  studentRoomImg,
  mainMenuOptBanner,
  shortButton,
  invertedButton,
  topButton,
  blueUnderlay,
  colorIcon,
  imageIcon,
  bboxIcon,
  handIcon,
  listIcon,
  iconBg
];

export default storySimulatorAssets;
