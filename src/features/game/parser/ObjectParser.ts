import { GameLocationAttr, LocationId } from '../location/GameMapTypes';
import { ObjectProperty } from '../objects/GameObjectTypes';
import StringUtils from '../utils/StringUtils';
import ActionParser from './ActionParser';
import Parser from './Parser';

export default class ObjectParser {
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

  private static objectAssetKey(shortPath: string) {
    return shortPath;
  }

  private static objectPath(shortPath: string) {
    return shortPath;
  }

  private static parseObjectConfig(locationId: LocationId, objectDetails: string) {
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
