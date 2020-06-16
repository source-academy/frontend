import { ImageAsset } from '../../commons/CommonsTypes';

export const chapterSelectBackground: ImageAsset = {
  key: 'chapter-select-bg',
  path:
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/yourRoom-dim/normal.png'
};

export const chapterRepeatButton: ImageAsset = {
  key: 'chapter-repeat',
  path: '../assets/chapterRepeat.png'
};

export const chapterContinueButton: ImageAsset = {
  key: 'chapter-continue',
  path: '../assets/chapterContinue.png'
};

export const chapterSelectAssets = [
  chapterSelectBackground,
  chapterRepeatButton,
  chapterContinueButton
];
