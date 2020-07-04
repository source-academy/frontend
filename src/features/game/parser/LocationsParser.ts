import Parser from './Parser';
import { Constants } from '../commons/CommonConstants';
import { GameMode } from '../mode/GameModeTypes';
import StringUtils from '../utils/StringUtils';

function locationAssetKey(shortPath: string) {
  return shortPath;
}

function locationPath(shortPath: string) {
  return Constants.assetsFolder + shortPath;
}

export default class LocationsParser {
  public static parse(locationDetails: string[]) {
    const gameMap = Parser.checkpoint.map;

    locationDetails.forEach(locationDetail => {
      const [id, shortPath, name] = StringUtils.splitByChar(locationDetail, ',');

      gameMap.addLocation(id, {
        id,
        name,
        assetKey: locationAssetKey(shortPath)
      });
      gameMap.addMapAsset(locationAssetKey(shortPath), locationPath(shortPath));
    });
  }
}

export const textToGameModeMap = {
  talk: GameMode.Talk,
  explore: GameMode.Explore,
  move: GameMode.Move,
  menu: GameMode.Menu
};
