import { GameImage, screenSize } from '../commons/CommonsTypes';

export const modeMenuBanner: GameImage = {
    key: 'mode-banner',
    path: '../../../../public/assets/modeMenuBanner.png',
    xPos: screenSize.x/2,
    yPos: screenSize.y/2,
    imageWidth: screenSize.x,
    imageHeight: screenSize.y
};

export const modeButton: GameImage = {
    key: 'mode-button',
    path: '../../../../public/assets/modeButton.png',
    xPos: screenSize.x/2,
    yPos: screenSize.y/2,
    imageWidth: screenSize.x,
    imageHeight: screenSize.y
}

const modeUIAssets = [modeButton, modeMenuBanner];

export default modeUIAssets;