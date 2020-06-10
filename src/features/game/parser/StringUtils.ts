type StringFilterFn = (line: string) => boolean;

type Header = string;
type StringMap = Map<Header, string[]>;

// Splits text into string array, removes newlines and whitespaces
export function splitToLines(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '');
}

/*
 * Given an array of lines, returns an object where the keys are the headings
 * without enclosing brackets `[]` e.g. part1, room, crashsite
 * and the value are the lines below each heading.
 */
export function mapByHeader(lines: string[], isHeaderFunction: StringFilterFn): StringMap {
  const map = new Map<Header, string[]>();
  let currHeader = '';
  lines.forEach(line => {
    if (isHeaderFunction(line)) {
      currHeader = stripEnclosing(line);
      map[currHeader] = [];
    } else {
      map[currHeader].push(line);
    }
  });
  return map;
}

// Removes
const stripEnclosing = (str: string) => str.slice(1, str.length - 1);
