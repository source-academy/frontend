import { mapByHeader } from './ParserHelper';
import { splitToLines } from './ParserHelper';
import { GameChapter } from '../chapter/GameChapterTypes';
import { GameItemTypeDetails } from '../location/GameMapConstants';

export default function DialogueParser(
  chapter: GameChapter,
  fileName: string,
  fileContent: string
) {
  console.log('Parsing dialogue...');

  if (fileName === 'dialogueLocation') {
    splitToLines(fileContent).forEach(line => {
      const [locationId, dialogueIds] = line.split(': ');

      dialogueIds.split(', ').forEach(dialogueId => {
        chapter.map.setItemAt(locationId, GameItemTypeDetails.Dialogue, dialogueId);
      });
    });
    return;
  }

  const lines = splitToLines(fileContent);
  const [titleWithLabel, ...restOfLines] = lines;
  const [, title] = titleWithLabel.split(': ');

  const dialogueObject = mapByHeader(restOfLines, isPartLabel);
  const dialogue = { title: title, content: dialogueObject };

  console.log(dialogue);

  // chapter.map.addItemToMap(GameItemTypeDetails.Dialogue, fileName, dialogue);
}

/* Parsing dialogue */
export const isPartLabel = (line: string) => new RegExp(/\[part[0-9]+\]/).test(line);
export const isGotoLabel = (line: string) => new RegExp(/\[Goto part[0-9]+\]/).test(line);
export const getPartToJump = (line: string) => line.match(/\[Goto (part[0-9]+)\]/)![1];
export const isSpeaker = (line: string) => line && line[0] === '$';
