import { AssetTypes } from '../commons/CommonTypes';
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
      const [id, shortPath, name, type, width, height, frame] = StringUtils.splitWithLimit(
        locationDetail,
        ',',
        6
      );
      Parser.validator.registerId(id);

      Parser.checkpoint.map.addLocation(id, {
        ...createEmptyLocation(),
        id,
        name,
        assetKey: this.locationAssetKey(shortPath)
      });
      Parser.checkpoint.map.addMapAsset(this.locationAssetKey(shortPath), {
        assetPath: this.locationPath(shortPath),
        assetType: AssetTypes[type] || AssetTypes.Image,
        assetConfig: {
          frameWidth: +width || 0,
          frameHeight: +height || 0,
          endFrame: +frame - 1 || 0
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
