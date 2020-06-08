import { GameImage, screenSize } from '../commons/CommonsTypes';
import { GameMode } from '../mode/GameModeTypes';

export type GameLocation = {
    key: string,
    backgroundImage: GameImage,
    mode?: GameMode[]
}

export const crashSiteImg: GameImage = {
    key: 'Crash Site',
    path: 'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/crashSite/normal.png',
    xPos: screenSize.x/2,
    yPos: screenSize.y/2,
    imageWidth: screenSize.x,
    imageHeight: screenSize.y
};

export const classRoomImg: GameImage = {
    key: 'Class Room',
    path: 'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/classroom/classOn.png',
    xPos: screenSize.x/2,
    yPos: screenSize.y/2,
    imageWidth: screenSize.x,
    imageHeight: screenSize.y
};

export const emergencyImg: GameImage = {
    key: 'Emergency',
    path: 'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/classroom/emergency.png',
    xPos: screenSize.x/2,
    yPos: screenSize.y/2,
    imageWidth: screenSize.x,
    imageHeight: screenSize.y
};

export const hallwayImg: GameImage = {
    key: 'Hallway',
    path: 'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/hallway/normal.png',
    xPos: screenSize.x/2,
    yPos: screenSize.y/2,
    imageWidth: screenSize.x,
    imageHeight: screenSize.y
};

export const studentRoomImg: GameImage = {
    key: 'Student Room',
    path: 'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/yourRoom-dim/normal.png',
    xPos: screenSize.x/2,
    yPos: screenSize.y/2,
    imageWidth: screenSize.x,
    imageHeight: screenSize.y
};
