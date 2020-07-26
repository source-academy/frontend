import { Constants } from '../commons/CommonConstants';

export const toTxtPath = (path: string) => `${Constants.assetsFolder}/stories/${path}`;

const TextAssets = {
  defaultCheckpoint: { key: 'default-chap', path: toTxtPath('defaultCheckpoint.txt') },
  awardsMapping: { key: 'awards-mapping', path: toTxtPath('awardsMapping.txt') }
};

export const MockTextAssets = {
  defaultCheckpoint: { key: 'default-chap', path: '../assets/mockDefaultCheckpoint.txt' },
  awardsMapping: { key: 'awards-mapping', path: '../assets/mockAwardsMapping.txt' }
};

export default TextAssets;
