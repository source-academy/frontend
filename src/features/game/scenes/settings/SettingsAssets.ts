import { studentRoomImg } from '../../location/GameMapConstants';
import { topButton, mediumBox, mediumButton } from '../../commons/CommonAssets';
import { ImageAsset } from '../../commons/CommonsTypes';

export const settingBg: ImageAsset = {
  key: 'settings-bg',
  path: '../assets/settingsBg.png'
};

export const settingOption: ImageAsset = {
  key: 'settings-opt',
  path: '../assets/settingsOption.png'
};

export const settingsAssets = [
  studentRoomImg,
  topButton,
  mediumBox,
  mediumButton,
  settingBg,
  settingOption
];
