import { AssetObject } from '../assets/AssetsTypes';
import { AssetKey, AssetPath, ItemId } from '../commons/CommonTypes';
import { toS3Path } from '../utils/GameUtils';
import StringUtils from '../utils/StringUtils';

class AssetParser {
  public static assetObject: AssetObject;

  public static parse(assetText: string): AssetObject {
    AssetParser.assetObject = {
      assetsMap: new Map<AssetKey, AssetPath>(),
      collectibles: new Map<ItemId, AssetKey>(),
      achievements: new Map<ItemId, AssetKey>()
    };

    const assetLines = StringUtils.splitToLines(assetText);
    const assetParagraphs = StringUtils.splitToParagraph(assetLines);

    console.log(assetParagraphs);

    assetParagraphs.forEach(([header, body]: [string, string[]]) => {
      AssetParser.parseAssetParagraphs(header, body);
    });
    return this.assetObject;
  }

  public static parseAssetParagraphs(header: string, body: string[]) {
    body.forEach(asset => {
      console.log(header);
      const [itemId, assetPath] = StringUtils.splitByChar(asset, ',');
      AssetParser.assetObject.assetsMap.set(
        AssetParser.assetKeyGenerator(assetPath),
        toS3Path(assetPath)
      );
      AssetParser.assetObject[header].set(itemId, assetPath);
    });
  }

  public static assetKeyGenerator(assetPath: string) {
    const assetPathArray = assetPath.split('/');
    return assetPathArray[assetPathArray.length - 1];
  }
}

export default AssetParser;
