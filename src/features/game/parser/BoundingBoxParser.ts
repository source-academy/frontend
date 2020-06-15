import { splitToLines } from './ParserHelper';
import { GameChapter } from '../chapter/GameChapterTypes';

export default function CharacterParser(
  chapter: GameChapter,
  fileName: string,
  fileContent: string
) {
  console.log('Parsing bounding boxes...');

  splitToLines(fileContent);
}
