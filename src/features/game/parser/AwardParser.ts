import { AwardProperty } from '../awards/GameAwardsTypes';
import { ItemId } from '../commons/CommonTypes';
import { toS3Path } from '../utils/GameUtils';
import StringUtils from '../utils/StringUtils';

/**
 * This class parses the awardsMapping.txt, and creates a
 * map of each item id to their corresponding award properties.
 */
class AwardParser {
  public static awardsMapping: Map<ItemId, AwardProperty>;

  /**
   * This function parses the awards and produces the mapping of award id to award properties.
   *
   * @param assetText the entire txt file
   * @returns {Map<ItemId, AwardProperty>} the mapping of the assets and details corresponding to each award id
   *                                       the award id may either refer to collectible id or achievement id
   */
  public static parse(assetText: string): Map<ItemId, AwardProperty> {
    AwardParser.awardsMapping = new Map<ItemId, AwardProperty>();

    const assetLines = StringUtils.splitToLines(assetText);
    const assetParagraphs = StringUtils.splitToParagraph(assetLines);

    assetParagraphs.forEach(([, awardBody]: [string, string[]]) => {
      AwardParser.parseAwardParagraphs(awardBody);
    });
    return this.awardsMapping;
  }

  /**
   * This parses the each award paragraph and stores award properties into the award mapping
   *
   * @param awardType whether the type is collectible or achievement
   * @param awardBody whether this is a
   */
  private static parseAwardParagraphs(awardBody: string[]) {
    const awardParagraph = StringUtils.splitToParagraph(awardBody);
    awardParagraph.forEach(([id, awardProperties]: [ItemId, string[]]) => {
      const [assetKey, assetPath, title, description] = StringUtils.splitWithLimit(
        awardProperties[0],
        ',',
        3
      );
      AwardParser.awardsMapping.set(id, {
        id,
        assetKey,
        assetPath: toS3Path(assetPath, true),
        title,
        description,
        completed: true
      });
    });
  }
}

export default AwardParser;
