import { AssetPath, ItemId } from '../commons/CommonTypes';
import { toS3Path } from '../utils/GameUtils';
import StringUtils from '../utils/StringUtils';

/**
 * This class parses the roomPreviewMapping.txt, and creates a
 * map of each assesment id to their corresponding background.
 */
class RoomPreviewParser {
  public static backgroundMapping: Map<ItemId, AssetPath>;

  /**
   * This function parses the text and produces the mapping of assessment id to background key.
   *
   * @param assetText the entire txt file
   * @returns {Map<ItemId, AssetPath>} the mapping of the assessment id to the background key
   */
  public static parse(assetText: string): Map<ItemId, AssetPath> {
    RoomPreviewParser.backgroundMapping = new Map<ItemId, AssetPath>();

    const assetLines = StringUtils.splitToLines(assetText);
    const assetParagraphs = StringUtils.splitToParagraph(assetLines);

    assetParagraphs.forEach(([assesmentId, assetPath]: [string, string[]]) => {
      RoomPreviewParser.backgroundMapping.set(assesmentId, toS3Path(assetPath[0], true));
    });
    return RoomPreviewParser.backgroundMapping;
  }
}

export default RoomPreviewParser;
