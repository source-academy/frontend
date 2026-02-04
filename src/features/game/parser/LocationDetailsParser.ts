import { AnimType, AssetType } from '../assets/AssetsTypes';
import { screenCenter, screenSize } from '../commons/CommonConstants';
import { createEmptyLocation } from '../location/GameMapHelper';
import StringUtils from '../utils/StringUtils';
import Parser from './Parser';

/**
 * This class parses the "locations" paragraphs,
 * and creates all the game locations declared
 * in the paragraph.
 */
export default class LocationDetailsParser {
  /**
   * This function parses location strings
   * and adds GameLocations to the map based on location
   * descriptions
   *
   * @param locationDetails the CSV lines containing descriptions about game locations
   */
  public static parse(locationDetails: string[]) {
    locationDetails.forEach(locationDetail => {
      const [id, shortPath, name, type, frame] = StringUtils.splitByChar(locationDetail, ',');
      Parser.validator.registerId(id);

      Parser.checkpoint.map.addLocation(id, {
        ...createEmptyLocation(),
        id,
        name,
        assetKey: this.locationAssetKey(shortPath)
      });

      Parser.checkpoint.map.addMapAsset(this.locationAssetKey(shortPath), {
        type: AssetType[type as keyof typeof AssetType] || AssetType.Image,
        key: id,
        path: this.locationPath(shortPath),
        config: {
          frameWidth: screenSize.x,
          frameHeight: screenSize.y,
          centreX: screenCenter.x,
          centreY: screenCenter.y,
          endFrame: parseInt(frame) - 1 || 0,
          animType: AnimType.Background
        }
      });
    });
  }

  /**
   * Genrates an asset key for the location
   *
   * @param shortPath the path to the location
   */
  private static locationAssetKey(shortPath: string) {
    return shortPath;
  }

  /**
   * Genrates an asset path for the location
   *
   * @param shortPath the path to the location
   */
  private static locationPath(shortPath: string) {
    return shortPath;
  }
}
