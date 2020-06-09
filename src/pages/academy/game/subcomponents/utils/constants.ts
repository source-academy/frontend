const screenHeight = 1080;
const screenWidth = 1920;

export const Constants = {
  screenHeight,
  screenWidth,
  centerX: screenWidth / 2,
  centerY: screenHeight / 2,
  repoAssetsFolder: '../../../assets',
  assetsFolder: 'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets',
  typeWriterInterval: 1,
  fadeDuration: 100,
  speechBoxPath: '../assets/speechbox.png',
  typeSoundPath: '../assets/type.mp3'
};

export const Keys = {
  selectedAsset: 'selectedAsset',
  initialPart: 'part0',
  narrator: 'narrator',
  you: 'you'
};
