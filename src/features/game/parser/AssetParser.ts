import { splitToLines, splitByChar } from './ParserHelper';
import Parser from './Parser';

export default function AssetParser(fileName: string, fileContent: string): void {
  const lines: string[] = splitToLines(fileContent);
  lines.forEach(assetString => {
    const [assetKey, assetPath] = splitByChar(assetString, ',');

    const [filename, ext] = assetPath.split('.');
    Parser.checkpoint.map.addMapAsset(assetKey, `../assets/${filename}.${ext || 'png'}`);
  });
}
