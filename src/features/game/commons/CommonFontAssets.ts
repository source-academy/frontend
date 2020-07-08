import { FontAsset } from './CommonTypes';

export const zektonFont: FontAsset = {
  key: 'zekton',
  pngPath: '../assets/zekton.png',
  fntPath: '../assets/zekton.fnt'
};

export const alienCowsFont: FontAsset = {
  key: 'alienAndCows',
  pngPath: '../assets/alien_and_cows.png',
  fntPath: '../assets/alien_and_cows.png'
};

const commonFontAssets = [zektonFont, alienCowsFont];

export default commonFontAssets;
