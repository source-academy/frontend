import { Constants } from '../commons/CommonConstants';

export default class StringUtils {
  /**
   * Splits text into several paragraphs, each containing header
   * string and body string array
   *
   * Example input:
   * ["objectives",
   * "    talkToHartin"
   * "    completeQuest"]
   *
   * Example output:
   * [ ["objectives"], ["talkToHartin", "completeQuest"] ]
   *
   * @param lines raw text strings
   * @returns {Array<[string, string[]]>} several parargraphs that have
   *                                      been split into head and body
   */
  public static splitToParagraph(lines: string[]) {
    const headerAndBodyLines: [string, string[]][] = [];
    lines.forEach((line: string) => {
      if (line.startsWith('\t') || line.startsWith('    ')) {
        const content = line.startsWith('\t') ? line.slice(1) : line.slice(4);
        if (headerAndBodyLines.length === 0) {
          console.error('Unexpected tabs');
          return;
        }
        const bodyLines = headerAndBodyLines[headerAndBodyLines.length - 1][1];
        bodyLines.push(content);
        return;
      }
      headerAndBodyLines.push([line.trim(), []]);
    });
    return headerAndBodyLines;
  }

  /**
   * Given an array of lines, returns a Map where the keys are the headings
   * and the value are the lines below each heading.
   *
   * @param lines lines to be processed
   * @param isHeaderFunction predicate that determines the header syntax. This
   *                         will be ran against every line, so take into account if you want
   *                         to detect header in the middle of line/in between lines.
   * @returns {Map<string, string>}
   */
  public static mapByHeader(
    lines: string[],
    isHeaderFunction: (line: string) => boolean
  ): Map<string, string[]> {
    const map = new Map<string, string[]>();
    if (!isHeaderFunction(lines[0])) {
      map.set('0', lines);
      return map;
    }
    let currHeader = '';
    lines.forEach(line => {
      if (isHeaderFunction(line)) {
        currHeader = line;
        map.set(line, []);
        return;
      }
      map.get(currHeader)!.push(line);
    });
    return map;
  }

  /**
   * Split using separator, but limit number of separators to split with.
   * After splitting, trim each entry to get rid of whitespaces.
   *
   * Example input: splitByChar("whatHappened, What Happened, Scottie?\n", ",", 1)
   * Example output: ["whatHappened", "What Happened, Scottie?"]
   * Explanation: This splits the string only using the first 1 comma then trims whitespaces
   *
   * @param line line to be split
   * @param sep separator to be used
   * @param limit the number of separators to split the string, undefined if use all separators
   * @param {Array<string>}
   */
  public static splitWithLimit(line: string, sep: string, limit: number): string[] {
    let lines = [];
    if (limit) {
      let currWord = '';
      for (let i = 0; i < line.length; i++) {
        const letter = line[i];
        if (letter === sep && lines.length < limit) {
          lines.push(currWord);
          currWord = '';
        } else {
          currWord += letter;
        }
      }
      lines.push(currWord);
    } else {
      lines = line.split(sep);
    }
    return lines.map((phrase: string) => phrase.trim());
  }

  /**
   * Split using separator. After splitting, trim each entry to get rid of whitespaces.
   *
   * @param line line to be split
   * @param sep separator to be used
   * @param {Array<string>}
   */
  public static splitByChar(line: string, sep: string): string[] {
    return line.split(sep).map((phrase: string) => phrase.trim());
  }

  /**
   * Splits text into string array and removes
   * lines with only newlines.
   *
   * @param text text to split
   * @returns {Array<string>}
   */
  public static splitToLines(text: string): string[] {
    return text
      .split('\n')
      .map(line => line.trimRight())
      .filter(line => line !== '');
  }

  /**
   * Capitalise first letter.
   *
   * @param word text to be capitalized
   * @returns {string}
   */
  public static capitalize(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  /**
   * Turns snake case to capitalized case.
   * Only accounts for letters, i.e. numbers and symbols will be discarded.
   * e.g. snake_case_to_capitalized -> Snake Case To Capitalized
   *
   * @param name text to be capitalized
   * @returns {string}
   */
  public static toCapitalizedWords(name: string) {
    const words = name.match(/[A-Za-z][a-z]*/g) || [];

    return words.map(StringUtils.capitalize).join(' ');
  }

  /**
   * Converts the given number into string. The given number
   * is rounded down.
   *
   * @param num number to be converted
   */
  public static toIntString(num: number) {
    return Math.floor(num).toString();
  }

  /**
   * Check whether given string is empty string.
   *
   * @param str string to check
   */
  public static isEmptyString(str: string) {
    return str === Constants.nullInteractionId;
  }
}
