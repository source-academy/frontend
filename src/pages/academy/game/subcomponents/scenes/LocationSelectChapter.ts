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

// Sample Map, arbritary set up
const locationImages: GameImage[] = [
  crashSiteImg,
  classRoomImg,
  emergencyImg,
  hallwayImg,
  studentRoomImg
];

const locationNames: string[] = [
  'Crash Site',
  'Class Room',
  'Emergency',
  'Hallway',
  'Student Room'
];

const locationModes: GameMode[][] = [
  [GameMode.Talk, GameMode.Move],
  [GameMode.Explore, GameMode.Talk, GameMode.Move],
  [GameMode.Talk, GameMode.Move],
  [GameMode.Move],
  [GameMode.Explore, GameMode.Move]
];

const locations: GameLocation[] = new Array<GameLocation>();
for (let i = 0; i < locationImages.length; i++) {
  locations.push({
    name: locationNames[i],
    assetKey: locationImages[i].key,
    assetXPos: locationImages[i].xPos,
    assetYPos: locationImages[i].yPos,
    modes: locationModes[i]
  });
}

// Register mapping and assets
locations.forEach(location => LocationSelectMap.setLocation(location));
locationImages.forEach(asset => LocationSelectMap.addLocationAsset(asset));

// Register navigation
LocationSelectMap.setNavigationFrom('Crash Site', ['Class Room']);
LocationSelectMap.setNavigationFrom('Class Room', ['Crash Site', 'Hallway']);
LocationSelectMap.setNavigationFrom('Emergency', ['Hallway']);
LocationSelectMap.setNavigationFrom('Hallway', ['Class Room', 'Student Room', 'Emergency']);
LocationSelectMap.setNavigationFrom('Student Room', ['Hallway']);

// Set talk topics
LocationSelectMap.setTalkTopicsAt('Crash Site', ['What happened', 'Planet XAE-12']);
LocationSelectMap.setTalkTopicsAt('Class Room', ["Today's lesson"]);
LocationSelectMap.setTalkTopicsAt('Emergency', ["Where's everyone", 'Any idea?']);

const LocationSelectChapter: GameChapter = {
  map: LocationSelectMap,
  startingLoc: 'Student Room'
};

export default LocationSelectChapter;
