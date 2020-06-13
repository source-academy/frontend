import * as _ from 'lodash';

type StringFilterFn = (line: string) => boolean;

type Header = string;
type StringMap = Map<Header, string[]>;

export function matchExact(r: RegExp, str: string) {
  const match = str.match(r);
  return !!(match && str === match[0]);
}

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
      currHeader = stripEnclosingChars(line);
      map.set(currHeader, []);
    } else {
      map.get(currHeader)!.push(line);
    }
  });
  return map;
}

// Removes enclosing characters, e.g. `[]`
export const stripEnclosingChars = (str: string, numCharsToRemove = 1) => {
  if (str.length < numCharsToRemove++) {
    return '';
  }
  numCharsToRemove -= 1;
  return str.slice(numCharsToRemove, str.length - numCharsToRemove);
};

/* Given the header's regexp, splits a text into arrays of
 *[ [header, contents], [header, contents], [header, contents] ]
 */
export function splitByHeader(text: string, regexString: RegExp) {
  const header = text.match(new RegExp(regexString, 'g'));
  const contents = text.split(new RegExp(regexString)).slice(1);
  return _.zip(header, contents);
}

// Match starting
export function matchStartingKey(object: object, string: string) {
  return Object.keys(object).filter(key => string.startsWith(key))[0];
}
