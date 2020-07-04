import { LocationId, GameLocationAttr } from '../location/GameMapTypes';
import Parser from './Parser';
import { Constants } from '../commons/CommonConstants';
import ActionParser from './ActionParser';
import StringUtils from '../utils/StringUtils';
import { ObjectProperty } from '../objects/GameObjectTypes';

function objectAssetKey(shortPath: string) {
  return shortPath;
}

function objectPath(shortPath: string) {
  return Constants.assetsFolder + shortPath;
}

export default class ObjectParser {
  public static parse(locationId: LocationId, objectList: string[]) {
    const objectParagraphs = StringUtils.splitToParagraph(objectList);

    objectParagraphs.forEach(([header, body]: [string, string[]]) => {
      const object = this.parseObjectConfig(locationId, header);
      if (body.length) {
        object.isInteractive = true;
        object.actionIds = ActionParser(body);
      }
    });
  }

  public static parseObjectConfig(locationId: LocationId, objectDetails: string) {
    const addToLoc = objectDetails[0] === '+';
    if (addToLoc) {
      objectDetails = objectDetails.slice(1);
    }

    const [objectId, shortPath, x, y, width, height] = StringUtils.splitByChar(objectDetails, ',');
    const objectProperty: ObjectProperty = {
      assetKey: objectAssetKey(shortPath),
      x: parseInt(x),
      y: parseInt(y),
      width: parseInt(width) || undefined,
      height: parseInt(height) || undefined,
      isInteractive: false,
      interactionId: objectId
    };

    Parser.checkpoint.map.addMapAsset(objectAssetKey(shortPath), objectPath(shortPath));

    Parser.checkpoint.map.addItemToMap(GameLocationAttr.objects, objectId, objectProperty);
    if (addToLoc) {
      Parser.checkpoint.map.setItemAt(locationId, GameLocationAttr.objects, objectId);
    }

    return objectProperty;
  }
}
