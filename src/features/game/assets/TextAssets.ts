import { AssetMap, TextAsset } from './AssetsTypes';

const TextAssets: AssetMap<TextAsset> = {
  defaultCheckpoint: { key: 'default-chap', path: '../assets/defaultCheckpoint.txt' },
  defaultAssets: { key: 'default-assets', path: '../assets/defaultAssets.txt' }
};

export default TextAssets;
