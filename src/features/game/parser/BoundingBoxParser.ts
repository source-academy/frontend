import { BBoxProperty } from '../boundingBoxes/GameBoundingBoxTypes';
import { GameItemType, LocationId } from '../location/GameMapTypes';
import StringUtils from '../utils/StringUtils';
import ActionParser from './ActionParser';
import Parser from './Parser';

/**
 * This class is in charge of parsing the boundingBoxes paragraph
 */
export default class BoundingBoxParser {
  /**
   * This parses the boundingBoxes paragraph (with actions) into Bounding Box Properties
   * and stores them in the correct location in the game map
   *
   * @param locationId locationId where the boundingBox paragraph is
   * @param boundingBoxList the list of raw bounding box strings in the paragraph
   */
  public static parse(locationId: LocationId, boundingBoxList: string[]) {
    const boundingBoxParagraphs = StringUtils.splitToParagraph(boundingBoxList);

    boundingBoxParagraphs.forEach(([header, body]: [string, string[]]) => {
      const boundingBox = this.parseBBoxConfig(locationId, header);
      if (body.length) {
        boundingBox.isInteractive = true;
        boundingBox.actionIds = ActionParser.parseActions(body);
      }
    });
  }

  /**
   * This class parses one bounding box CSV and produces a
   * Bounding box property from that bounding box string
   *
   * @param locationId LocationId where the bounding box paragraph is
   * @param bboxDetails One bounding box CSV line
   * @returns {BBoxProperty} corresponding bbox property produced from that CSV line
   */
  private static parseBBoxConfig(locationId: LocationId, bboxDetails: string): BBoxProperty {
    const addToLoc = bboxDetails[0] === '+';
    if (addToLoc) {
      bboxDetails = bboxDetails.slice(1);
    }

    const [bboxId, x, y, width, height] = StringUtils.splitByChar(bboxDetails, ',');
    const bboxProperty: BBoxProperty = {
      x: parseInt(x),
      y: parseInt(y),
      width: parseInt(width),
      height: parseInt(height),
      isInteractive: false,
      interactionId: bboxId
    };

    Parser.validator.registerId(bboxId);
    Parser.checkpoint.map.setItemInMap(GameItemType.boundingBoxes, bboxId, bboxProperty);
    if (addToLoc) {
      Parser.checkpoint.map.addItemToLocation(locationId, GameItemType.boundingBoxes, bboxId);
    }

    return bboxProperty;
  }
}
