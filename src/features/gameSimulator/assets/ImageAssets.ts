import { AssetMap, AssetType, ImageAsset } from 'src/features/game/assets/AssetsTypes';

const SSImageAssets: AssetMap<ImageAsset> = {
  storySimBg: {
    type: AssetType.Image,
    key: 'student-room',
    path: '/locations/deathCube_ext/shields-down.png'
  },
  shortButton: { type: AssetType.Image, key: 'short-button', path: '/ui/shortButton.png' },
  invertedButton: {
    type: AssetType.Image,
    key: 'inverted-button',
    path: '/ui/invertedColorButton.png'
  },
  blueUnderlay: { type: AssetType.Image, key: 'blue-underlay', path: '/ui/blueUnderlay.png' },
  topButton: { type: AssetType.Image, key: 'top-button', path: '/ui/topButton.png' },
  colorIcon: { type: AssetType.Image, key: 'color-icon', path: '/ui/colorIcon.png' },
  imageIcon: { type: AssetType.Image, key: 'image-icon', path: '/ui/imageIcon.png' },
  bboxIcon: { type: AssetType.Image, key: 'bbox-icon', path: '/ui/bboxIcon.png' },
  handIcon: { type: AssetType.Image, key: 'hand-icon', path: '/ui/handIcon.png' },
  listIcon: { type: AssetType.Image, key: 'list-icon', path: '/ui/listIcon.png' },
  eraseIcon: { type: AssetType.Image, key: 'erase-icon', path: '/ui/eraserIcon.png' },
  iconBg: { type: AssetType.Image, key: 'icon-bg', path: '/ui/modeIconBg.png' }
};

export default SSImageAssets;
