import { FontAsset } from './CommonTypes';

export const zektonFont: FontAsset = {
  key: 'zekton',
  pngPath: '../assets/zekton.png',
  fntPath: '../assets/zekton.fnt'
};

export const alienCowsFont: FontAsset = {
  key: 'alienAndCows',
  pngPath: '../assets/alien_and_cows.png',
  fntPath: '../assets/alien_and_cows.fnt'
};

export const alienLeagueFont: FontAsset = {
  key: 'alienLeague',
  pngPath: '../assets/alien_league.png',
  fntPath: '../assets/alien_league.fnt'
};

const commonFontAssets = [zektonFont, alienCowsFont, alienLeagueFont];

export default commonFontAssets;
