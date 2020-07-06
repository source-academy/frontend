import { ImageAsset } from '../../commons/CommonsTypes';
import { topButton } from '../../commons/CommonAssets';

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

export const chapterSelectFrame: ImageAsset = {
  key: 'chapter-select-frame',
  path: '../assets/chapterSelectionFrame.png'
};

export const chapterSelectBorder: ImageAsset = {
  key: 'chapter-select-border',
  path: '../assets/chapterSelectionBorder.png'
};

export const chapterSelectArrow: ImageAsset = {
  key: 'chapteer-select-arrow',
  path: '../assets/chapSelectArrow.png'
};

export const chapterSelectAssets = [
  chapterSelectBackground,
  chapterRepeatButton,
  chapterContinueButton,
  chapterSelectFrame,
  chapterSelectBorder,
  chapterSelectArrow,
  topButton
];
