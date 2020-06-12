import { ImageAsset } from './CommonsTypes';

export const Constants = {
  repoAssetsFolder: '../../../assets',
  assetsFolder: 'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets',
  fadeDuration: 100
};

export const screenSize = {
  x: 1920,
  y: 1080
};

export const screenCenter = {
  x: screenSize.x / 2,
  y: screenSize.y / 2
};

export const shortButton: ImageAsset = {
  key: 'short-button',
  path: '../assets/shortButton.png'
};

export const longButton: ImageAsset = {
  key: 'long-button',
  path: '../assets/longButton.png'
};

export const topButton: ImageAsset = {
  key: 'top-button',
  path: '../assets/topButton.png'
};
