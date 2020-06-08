import { GameChapter } from '../../../../../features/game/chapter/GameChapterTypes';
import GameMap from '../../../../../features/game/location/GameMap';
import {
    crashSiteImg,
    classRoomImg,
    emergencyImg,
    hallwayImg,
    studentRoomImg,
    GameLocation
} from '../../../../../features/game/location/GameMapTypes';
import { GameMode } from '../../../../../features/game/mode/GameModeTypes';
import { GameImage } from 'src/features/game/commons/CommonsTypes';

const LocationSelectMap = new GameMap();

// Sample Map, all location has both explore and talk for set up convenience 
const locationImages: GameImage[] = [crashSiteImg, classRoomImg, emergencyImg, hallwayImg, studentRoomImg];
const locations: GameLocation[] = locationImages.map(image => {
    return { key: image.key, backgroundImage: image, mode: [GameMode.Explore, GameMode.Talk] };
});
locations.forEach(location => LocationSelectMap.setLocation(location));

LocationSelectMap.setNavigationFrom(classRoomImg.key, [crashSiteImg.key, hallwayImg.key]);
LocationSelectMap.setNavigationFrom(crashSiteImg.key, [classRoomImg.key]);
LocationSelectMap.setNavigationFrom(hallwayImg.key, [classRoomImg.key, studentRoomImg.key, emergencyImg.key]);
LocationSelectMap.setNavigationFrom(studentRoomImg.key, [hallwayImg.key]);
LocationSelectMap.setNavigationFrom(emergencyImg.key, [hallwayImg.key]);

const LocationSelectChapter: GameChapter = {
    map: LocationSelectMap,
    startingLoc: studentRoomImg.key
};

export default LocationSelectChapter;