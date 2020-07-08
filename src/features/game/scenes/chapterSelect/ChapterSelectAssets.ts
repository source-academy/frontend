import { ImageAsset } from '../../commons/CommonTypes';
import { topButton } from '../../commons/CommonAssets';

export const chapterSelectBackground: ImageAsset = {
  key: 'chapter-select-bg',
  path: '/locations/yourRoom-dim/normal.png'
};

export const chapterRepeatButton: ImageAsset = {
  key: 'chapter-repeat',
  path: '/ui/chapterRepeat.png'
};

export const chapterContinueButton: ImageAsset = {
  key: 'chapter-continue',
  path: '/ui/chapterContinue.png'
};

export const chapterSelectFrame: ImageAsset = {
  key: 'chapter-select-frame',
  path: '/ui/chapterSelectionFrame.png'
};

export const chapterSelectBorder: ImageAsset = {
  key: 'chapter-select-border',
  path: '/ui/chapterSelectionBorder.png'
};

export const chapterSelectArrow: ImageAsset = {
  key: 'chapteer-select-arrow',
  path: '/ui/chapSelectArrow.png'
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
