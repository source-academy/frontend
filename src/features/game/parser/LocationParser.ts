import Parser from './Parser';
import { splitToLines, stripEnclosingChars, splitByChar } from './ParserHelper';
import { Constants } from '../commons/CommonConstants';
import { GameMode } from '../mode/GameModeTypes';
import ActionParser from './ActionParser';

function locationAssetKey(shortPath: string) {
  return shortPath;
}

function locationAssetValue(shortPath: string) {
  const [location, skin] = shortPath.split('/');
  return Constants.assetsFolder + '/locations/' + location + '/' + (skin || 'normal') + '.png';
}

export default function LocationParser(fileName: string, fileContent: string): void {
  const gameMap = Parser.chapter.map;
  const [locationAssets, locationActions, locationModes, navigation] = fileContent.split('$');

  const locationIds: string[] = [];

  // Parse and load location assets
  splitToLines(locationAssets).forEach(locationAsset => {
    const [id, shortPath, name] = splitByChar(locationAsset, ',');

    locationIds.push(id);
    gameMap.addLocation(id, {
      id,
      name,
      assetKey: locationAssetKey(shortPath)
    });
    gameMap.addMapAsset(locationAssetKey(shortPath), locationAssetValue(shortPath));
  });

  splitToLines(locationActions).forEach(locationAction => {
    const [locationId, ...actions] = splitByChar(locationAction, ',');

    const gameLocation = Parser.chapter.map.getLocationAtId(locationId);
    gameLocation.actionIds = ActionParser(actions);
  });

  // Parse modes per location
  splitToLines(locationModes).forEach((modes, modeIndex) => {
    const formattedModeNames = stripEnclosingChars(modes)
      .split(' ')
      .map(mode => textToGameModeMap[mode]);
    gameMap.setModesAt(locationIds[modeIndex], formattedModeNames);
  });

  // Parse which locations can be visited from one location
  splitToLines(navigation).forEach(location => {
    const [locationId, connectedTo] = location.split(': ');
    gameMap.setNavigationFrom(locationId, connectedTo.split(', '));
  });
}

export const textToGameModeMap = {
  talk: GameMode.Talk,
  explore: GameMode.Explore,
  move: GameMode.Move,
  menu: GameMode.Menu
};
