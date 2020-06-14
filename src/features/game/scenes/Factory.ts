import { isPartLabel } from '../dialogue/DialogueHelper';
import { splitToLines, mapByHeader } from '../parser/ParserHelper';

const text1 = `[part0]
$narrator
The year is 1101 A.E.
[Goto part2]

[part2]
$beat, happy
Whew... That was a long trip. It feels like I was on that shuttle for a thousand years.
$none
That I like.
Hello what?
`;

const text2 = `[part0]
$narrator
When you were about to take a nap, you received a new notification o
[Goto part3]

[part3]
$you, tired
Grandmaster's hologram is so realistic, his voice sends shiver down your spine`;

function createDialogueObject(title: string, text: string) {
  const lines = splitToLines(text);
  return { title, content: mapByHeader(lines, isPartLabel) };
}

export const dialogue1 = createDialogueObject('Random Title', text1);
export const dialogue2 = createDialogueObject('What happened?', text2);
