import { AssetMap, FontAsset } from './AssetsTypes';

const FontAssets: AssetMap<FontAsset> = {
  zektonFont: {
    key: 'zekton',
    pngPath: '../../assets/zekton.png',
    fntPath: '../../assets/zekton.fnt'
  },
  zektonDarkFont: {
    key: 'zektonDark',
    pngPath: '../../assets/zekton_dark.png',
    fntPath: '../../assets/zekton.fnt'
  },
  alienCowsFont: {
    key: 'alienAndCows',
    pngPath: '../../assets/alien_and_cows.png',
    fntPath: '../../assets/alien_and_cows.fnt'
  },
  alienLeagueFont: {
    key: 'alienLeague',
    pngPath: '../../assets/alien_league.png',
    fntPath: '../../assets/alien_league.fnt'
  },
  pixelFont: {
    key: 'pixel',
    pngPath: '../../assets/pixel.png',
    fntPath: '../../assets/pixel.fnt'
  }
};

export default FontAssets;
