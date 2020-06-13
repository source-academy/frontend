import { mapByHeader } from './StringUtils';
import { splitToLines } from './StringUtils';
import { GameChapter } from '../chapter/GameChapterTypes';
import { GameItemTypeDetails } from '../location/GameMapConstants';
import { isPartLabel } from '../dialogue/DialogueHelper';

export default function DialogueParser(
  chapter: GameChapter,
  fileName: string,
  fileContent: string
) {
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
  const [, title] = titleWithLabel.split(', ');

  const dialogueObject = mapByHeader(restOfLines, isPartLabel);
  const dialogue = { title: title, content: dialogueObject };

  chapter.map.addItemToMap(GameItemTypeDetails.Dialogue, fileName, dialogue);
}
