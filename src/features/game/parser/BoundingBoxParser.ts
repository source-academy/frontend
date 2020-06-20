import { splitToLines } from './ParserHelper';

import { mapByHeader, isEnclosedBySquareBrackets, splitByChar } from './ParserHelper';
import { LocationId, GameLocationAttr } from '../location/GameMapTypes';
import Parser from './Parser';
import ActionParser from './ActionParser';
import { BBoxProperty } from '../boundingBoxes/GameBoundingBoxTypes';

export default function BoundingBoxParser(fileName: string, fileContent: string) {
  const lines: string[] = splitToLines(fileContent);
  const locationRawBBMap: Map<LocationId, string[]> = mapByHeader(
    lines,
    isEnclosedBySquareBrackets
  );

  locationRawBBMap.forEach(addBBoxToLoc);
}

function addBBoxToLoc(bboxList: string[], locationId: LocationId): void {
  const separatorIndex = bboxList.findIndex(bbox => bbox === '$');
  const bboxDetails = bboxList.slice(0, separatorIndex);

  // Parse basic bbox
  bboxDetails.forEach(bboxDetails => {
    const toAddToMap = bboxDetails && bboxDetails[0] === '+';
    if (toAddToMap) {
      bboxDetails = bboxDetails.slice(1);
    }

    const [bboxId, x, y, width, height] = splitByChar(bboxDetails, ',');

    const bbox: BBoxProperty = {
      x: parseInt(x),
      y: parseInt(y),
      width: parseInt(width),
      height: parseInt(height),
      isInteractive: false,
      interactionId: bboxId
    };

    Parser.chapter.map.addItemToMap(GameLocationAttr.boundingBoxes, bboxId, bbox);

    if (toAddToMap) {
      Parser.chapter.map.setItemAt(locationId, GameLocationAttr.boundingBoxes, bboxId);
    }
  });

  // Parse actions
  if (separatorIndex !== -1) {
    const bboxActions = bboxList.slice(separatorIndex + 1, bboxList.length);
    bboxActions.forEach(bboxDetail => {
      const [bboxId, ...actions] = bboxDetail.split(', ');

      const bBoxProperty = Parser.chapter.map.getBBoxes().get(bboxId);
      if (bBoxProperty) {
        bBoxProperty.actionIds = ActionParser(actions);
        bBoxProperty.isInteractive = true;
      }
    });
  }
}
