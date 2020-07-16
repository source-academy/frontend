import { AwardProperty } from '../award/AwardTypes';
import { ItemId } from '../commons/CommonTypes';
import { toS3Path } from '../utils/GameUtils';
import StringUtils from '../utils/StringUtils';
import ParserConverter from './ParserConverter';

class AwardParser {
  public static awardsMapping: Map<ItemId, AwardProperty>;

  public static parse(assetText: string): Map<ItemId, AwardProperty> {
    AwardParser.awardsMapping = new Map<ItemId, AwardProperty>();

    const assetLines = StringUtils.splitToLines(assetText);
    const assetParagraphs = StringUtils.splitToParagraph(assetLines);

    assetParagraphs.forEach(([awardType, awardBody]: [string, string[]]) => {
      AwardParser.parseAwardParagraphs(awardType, awardBody);
    });
    return this.awardsMapping;
  }

  public static parseAwardParagraphs(awardType: string, awardBody: string[]) {
    const awardParagraph = StringUtils.splitToParagraph(awardBody);
    awardParagraph.forEach(([id, awardProperty]: [ItemId, string[]]) => {
      const [assetKey, assetPath, title, description] = awardProperty;
      AwardParser.awardsMapping.set(id, {
        id,
        assetKey,
        assetPath: toS3Path(assetPath),
        title,
        description,
        awardType: ParserConverter.stringToUserState(awardType)
      });
    });
  }
}

export default AwardParser;
