import Parser from './Parser';
import StringUtils from '../utils/StringUtils';

export default function AssetParser(fileName: string, fileContent: string): void {
  const lines: string[] = StringUtils.splitToLines(fileContent);
  lines.forEach(assetString => {
    const [assetKey, assetPath] = StringUtils.splitByChar(assetString, ',');

    const [filename, ext] = assetPath.split('.');
    Parser.checkpoint.map.addMapAsset(assetKey, `../assets/${filename}.${ext || 'png'}`);
  });
}
