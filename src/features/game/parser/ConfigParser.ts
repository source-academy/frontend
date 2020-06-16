import { splitToLines } from './ParserHelper';
import Parser from './Parser';

export default function ConfigParser(fileName: string, fileContent: string): void {
  const textFile = splitToLines(fileContent);
  const [, startingLoc] = textFile[0].split(': ');
  Parser.chapter.startingLoc = startingLoc;
}
