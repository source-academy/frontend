import { GameLocationAttr, LocationId } from '../location/GameMapTypes';
import { ObjectProperty } from '../objects/GameObjectTypes';
import StringUtils from '../utils/StringUtils';
import ActionParser from './ActionParser';
import Parser from './Parser';

/**
 * This class parses object CSV's into Object Properties
 */
export default class ObjectParser {
  /**
   * This function parses object CSVs in a location,
   * and creates Object Properties corresponding to the each object CSV,
   * and stores these Object Properties into the game map.
   *
   * The class also parses actions of objects if any.
   *
   * @param locationId the location where the object paragraph can be found
   * @param objectList the list of lines describing objects in the location, including actions
   */
  public static parse(locationId: LocationId, objectList: string[]) {
    const objectParagraphs = StringUtils.splitToParagraph(objectList);

    objectParagraphs.forEach(([header, body]: [string, string[]]) => {
      const object = this.parseObjectConfig(locationId, header);
      if (body.length) {
        object.isInteractive = true;
        object.actionIds = ActionParser.parseActions(body);
      }
    });
  }

  /**
   * Generates an asset key based on the object path
   *
   * @param shortPath path to the object
   */
  private static objectAssetKey(shortPath: string) {
    return shortPath;
  }

  /**
   * Generates an asset path based on the object path
   *
   * @param shortPath path to the object
   */
  private static objectPath(shortPath: string) {
    return shortPath;
  }

  /**
   * This function parses one object CSV into an Object Property,
   * and places the object inside the game map.
   *
   * It also returns the reference to the object property, so that
   * actionIds can be added to it.
   *
   * @param locationId The location id
   * @param objectDetails One line containing an object CSV
   * @returns {ObjectProperty} the object property created
   */
  private static parseObjectConfig(locationId: LocationId, objectDetails: string): ObjectProperty {
    const addToLoc = objectDetails[0] === '+';
    if (addToLoc) {
      objectDetails = objectDetails.slice(1);
    }

    const [objectId, shortPath, x, y, width, height] = StringUtils.splitByChar(objectDetails, ',');
    const objectProperty: ObjectProperty = {
      assetKey: this.objectAssetKey(shortPath),
      x: parseInt(x),
      y: parseInt(y),
      width: parseInt(width) || undefined,
      height: parseInt(height) || undefined,
      isInteractive: false,
      interactionId: objectId
    };

    Parser.checkpoint.map.addMapAsset(this.objectAssetKey(shortPath), this.objectPath(shortPath));

    Parser.checkpoint.map.addItemToMap(GameLocationAttr.objects, objectId, objectProperty);
    if (addToLoc) {
      Parser.checkpoint.map.setItemAt(locationId, GameLocationAttr.objects, objectId);
    }

    return objectProperty;
  }
}
