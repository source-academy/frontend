import { isPartLabel } from '../dialogue/DialogueHelper';
import { splitToLines, mapByHeader } from '../parser/ParserHelper';

const text1 = `[part0]
$narrator
The year is 1101 A.E.
[Goto part2]

[part2]
$you, tired
Whew... That was a long trip. It feels like I was on that shuttle for a thousand years.
`;

function createDialogueObject(text: string) {
  const lines = splitToLines(text);
  return { title: 'Random Title', content: mapByHeader(lines, isPartLabel) };
}
export const dialogue1 = createDialogueObject(text1);
