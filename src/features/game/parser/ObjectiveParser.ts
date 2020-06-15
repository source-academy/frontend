import { splitToLines } from './ParserHelper';

export default function CharacterParser(fileName: string, fileContent: string): void {
  splitToLines(fileContent);
}
