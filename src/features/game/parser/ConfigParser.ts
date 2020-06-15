import { GameChapter } from '../chapter/GameChapterTypes';
import { splitToLines } from './ParserHelper';

export default function ConfigParser(chapter: GameChapter, fileName: string, fileContent: string) {
  const textFile = splitToLines(fileContent);
  const [, startingLoc] = textFile[0].split(': ');
  chapter.startingLoc = startingLoc;
}
