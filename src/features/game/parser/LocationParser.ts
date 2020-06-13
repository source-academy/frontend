import { GameChapter } from '../chapter/GameChapterTypes';
import { splitToLines, stripEnclosingChars } from './StringUtils';
import { Constants } from '../commons/CommonConstants';

function locationKey(shortPath: string) {
  return shortPath;
}

function locationLongPath(shortPath: string) {
  const [location, skin] = shortPath.split('/');
  return Constants.assetsFolder + '/locations' + location + '/' + (skin || 'normal');
}

export default function LocationParser(
  chapter: GameChapter,
  fileName: string,
  fileContent: string
) {
  const gameMap = chapter.map;
  const [locationAssets, locationModes, connectivity] = fileContent.split('$');

  const locationIds: string[] = [];

  splitToLines(locationAssets).forEach(locationAsset => {
    const [locationId, shortPath, locationName] = locationAsset.split(', ');
    locationIds.push(locationId);
    gameMap.addLocation(locationId, { name: locationName, assetKey: locationKey(shortPath) });
    gameMap.addMapAsset(locationKey(shortPath), locationLongPath(shortPath));
  });

  splitToLines(locationModes).forEach((modes, modeIndex) => {
    gameMap.setNavigationFrom(locationIds[modeIndex], stripEnclosingChars(modes).split(' '));
  });

  splitToLines(connectivity).forEach(location => {
    const [locationId, connectedTo] = location.split(': ');
    gameMap.setNavigationFrom(locationId, connectedTo.split(', '));
  });
}
