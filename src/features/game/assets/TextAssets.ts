import { Constants } from '../commons/CommonConstants';

export const toTxtPath = (path: string) => `${Constants.assetsFolder}/stories/${path}`;

const TextAssets = {
  defaultCheckpoint: { key: 'default-chap', path: toTxtPath('defaultCheckpoint.txt') },
  awardsMapping: { key: 'awards-mapping', path: toTxtPath('awardsMapping.txt') }
};

export default TextAssets;
