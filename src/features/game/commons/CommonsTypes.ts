export const screenSize = {
    x: 1920,
    y: 1080
}

export type GameImage = {
    key: string;
    path: string;
    xPos: number;
    yPos: number;
    imageWidth: number;
    imageHeight: number;
}

export type GameButton = {
    text?: string;
    assetKey: string;
    assetXPos: number;
    assetYPos: number;
}