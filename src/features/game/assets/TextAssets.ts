import { AssetMap, TextAsset } from './AssetsTypes';

const TextAssets: AssetMap<TextAsset> = {
  defaultCheckpoint: { key: 'default-chap', path: '../assets/defaultCheckpoint.txt' },
  awardsMapping: { key: 'awards-mapping', path: '../assets/awardsMapping.sa' }
};

export default TextAssets;
