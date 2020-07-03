import Parser from './Parser';
import { splitToLines, splitByChar } from './ParserHelper';
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
  const gameMap = Parser.checkpoint.map;
  const [locationAssets, locationModes, navigation, locationActions] = fileContent.split('$');

  // Parse and load location assets
  splitToLines(locationAssets).forEach(locationAsset => {
    const [id, shortPath, name] = splitByChar(locationAsset, ',');

    gameMap.addLocation(id, {
      id,
      name,
      assetKey: locationAssetKey(shortPath)
    });
    gameMap.addMapAsset(locationAssetKey(shortPath), locationAssetValue(shortPath));
  });

  // Parse modes per location
  splitToLines(locationModes).forEach(location => {
    const [locationId, modes] = location.split(': ');
    const gameModes = splitByChar(modes, ',').map(mode => textToGameModeMap[mode]);
    gameMap.setModesAt(locationId, gameModes);
  });

  // Parse which locations can be visited from one location
  splitToLines(navigation).forEach(location => {
    const [locationId, connectedTo] = location.split(': ');
    gameMap.setNavigationFrom(locationId, connectedTo.split(', '));
  });

  // Parse actions per location
  splitToLines(locationActions).forEach(locationAction => {
    const [locationId, ...actions] = splitByChar(locationAction, ',');
    const gameLocation = Parser.checkpoint.map.getLocationAtId(locationId);
    gameLocation.actionIds = ActionParser(actions);
  });
}

export const textToGameModeMap = {
  talk: GameMode.Talk,
  explore: GameMode.Explore,
  move: GameMode.Move,
  menu: GameMode.Menu
};
