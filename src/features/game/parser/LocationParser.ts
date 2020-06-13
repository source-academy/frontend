import { GameChapter } from '../chapter/GameChapterTypes';
import { splitToLines, stripEnclosingChars, capitalise } from './ParserHelper';
import { Constants } from '../commons/CommonConstants';
import { textToGameModeMap } from './ParserConstants';

function locationKey(shortPath: string) {
  return shortPath;
}

function locationLongPath(shortPath: string) {
  const [location, skin] = shortPath.split('/');
  return Constants.assetsFolder + '/locations/' + location + '/' + (skin || 'normal') + '.png';
}

export default function LocationParser(
  chapter: GameChapter,
  fileName: string,
  fileContent: string
) {
  console.log('Parsing location...');
  const gameMap = chapter.map;
  const [locationAssets, locationModes, connectivity] = fileContent.split('\n$\n');

  const locationIds: string[] = [];

  splitToLines(locationAssets).forEach(locationAsset => {
    const [locationId, shortPath, fullLocationName] = locationAsset.split(', ');
    const locationName = stripEnclosingChars(fullLocationName);

    locationIds.push(locationId);
    gameMap.addLocation(locationId, { name: locationName, assetKey: locationKey(shortPath) });
    gameMap.addMapAsset(locationKey(shortPath), locationLongPath(shortPath));
  });

  splitToLines(locationModes).forEach((modes, modeIndex) => {
    const formattedModeNames = stripEnclosingChars(modes)
      .split(' ')
      .map(mode => textToGameModeMap[capitalise(mode)]);
    gameMap.setModesAt(locationIds[modeIndex], formattedModeNames);
  });

  splitToLines(connectivity).forEach(location => {
    const [locationId, connectedTo] = location.split(': ');
    gameMap.setNavigationFrom(locationId, connectedTo.split(', '));
  });
}
