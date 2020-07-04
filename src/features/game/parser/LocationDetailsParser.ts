import Parser from './Parser';
import { Constants } from '../commons/CommonConstants';
import StringUtils from '../utils/StringUtils';

export default class LocationDetailsParser {
  public static parse(locationDetails: string[]) {
    locationDetails.forEach(locationDetail => {
      const [id, shortPath, name] = StringUtils.splitByChar(locationDetail, ',', 2);

      Parser.checkpoint.map.addLocation(id, {
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
    return Constants.assetsFolder + shortPath;
  }
}
