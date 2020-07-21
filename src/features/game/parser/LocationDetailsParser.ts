import { createEmptyLocation } from '../location/GameMapHelper';
import StringUtils from '../utils/StringUtils';
import Parser from './Parser';

export default class LocationDetailsParser {
  public static parse(locationDetails: string[]) {
    locationDetails.forEach(locationDetail => {
      const [id, shortPath, name] = StringUtils.splitByChar(locationDetail, ',', 2);
      Parser.checkpoint.map.addLocation(id, {
        ...createEmptyLocation(),
        id,
        name,
        assetKey: this.locationAssetKey(shortPath)
      });
      Parser.checkpoint.map.addMapAsset(
        this.locationAssetKey(shortPath),
        this.locationPath(shortPath)
      );
    });
  }

  private static locationAssetKey(shortPath: string) {
    return shortPath;
  }

  private static locationPath(shortPath: string) {
    return shortPath;
  }
}
