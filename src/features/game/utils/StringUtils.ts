import { Constants } from '../commons/CommonConstants';

export default class StringUtils {
  /**
   * Splits text into several paragraphs, each containing header
   * string and body string array
   *
   * Example input:
   * ["objectives",
   * "    talkToHartin"
   * "    completeTask"]
   *
   * Example output:
   * [ ["objectives"], ["talkToHartin", "completeTask"] ]
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
   * Example input: splitWithLimit("whatHappened, What Happened, Scottie?\n", ",", 1)
   * Example output: ["whatHappened", "What Happened, Scottie?"]
   * Explanation: This splits the string only using the first 1 comma then trims whitespaces
   *
   * @param line line to be split
   * @param sep separator to be used
   * @param limit limit the number of separators to split the string, undefined if use all separators
   * @returns {Array<string>}
   */
  public static splitWithLimit(line: string, sep: string, limit: number): string[] {
    if (limit >= 0) {
      const lines = line.split(sep);
      const substrings = lines.slice(0, limit);
      substrings.push(lines.slice(limit).join(sep));
      return substrings.map((phrase: string) => phrase.trim());
    }
    return StringUtils.splitByChar(line, sep);
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
   * Splits text into string array, removes lines
   * with only newlines and removes characters that
   * are commented out in single and multi line
   * comments
   *
   * @param text text to split
   * @returns {Array<string>}
   */
  public static splitToLinesAndRemoveComments(text: string): string[] {
    return this.removeMultiLineComments(text.split('\n'), '/*', '*/')
      .map(line => this.removeSingleLineComment(line, '//'))
      .map(line => line.trimRight())
      .filter(line => line !== '');
  }

  /**
   * Removes characters from string before/after
   * specified comment characters
   *
   * Example input:
   * removeSingleLineComment('Hello # World','#',false)
   *
   * Example output:
   * 'Hello '
   *
   * @param text text with single line comments
   * @param commentChars characters to denote comment region
   * @param removeAfter (optional) true - remove characters after commentChars,
   *                              false - remove characters before commentChars
   * @returns {string}
   */
  public static removeSingleLineComment(
    text: string,
    commentChars: string,
    removeAfter: boolean = true
  ) {
    const commentIndex = text.indexOf(commentChars);
    return commentIndex === -1
      ? text
      : removeAfter
        ? text.slice(0, commentIndex)
        : text.slice(commentIndex + commentChars.length);
  }

  /**
   * Given an array of lines with a
   * a subset of characters commented out
   * by specified open and close comment
   * characters, Returns an array of lines
   * with characters inside commented regions
   * removed
   *
   * Example input:
   * removeMultiLineComments(
   * ['objectives',
   * '    checkedScreen',
   * '    talkedToLokKim1',
   * '/!    talkedToLokKim2',
   * '    talkedToLokKim3!/'],
   *  '/!', '!/');
   *
   * Example output:
   * ['objectives',
   * '    checkedScreen',
   * '    talkedToLokKim1']
   *
   * @param lines lines to remove comments from
   * @param openCommentChars characters to denote open comment
   * @param closeCommentChars characters to denote close comment
   * @returns {Array<string>}
   */
  public static removeMultiLineComments(
    lines: string[],
    openCommentChars: string,
    closeCommentChars: string
  ): string[] {
    const newLines = [];
    let commentOpen = false;

    for (let l = 0; l < lines.length; l++) {
      const line = lines[l];
      const commentRegions: [number, number][] = [];
      const openIns = this.findAllInstances(line, openCommentChars);
      const closeIns = this.findAllInstances(line, closeCommentChars);
      let activeIndex = -1; // current valid comment index in line
      let openInd = 0; // open comment index in openIns
      let closeInd = 0; // close comment index in closeIns
      let region = commentOpen ? [0] : [];

      while (openInd < openIns.length || closeInd < closeIns.length) {
        const prevActive = activeIndex;
        activeIndex = commentOpen
          ? closeIns[closeInd++] + closeCommentChars.length
          : openIns[openInd++];
        if (activeIndex <= prevActive) {
          console.error(`Comment mismatch: Line ${l + 1},  Pos ${activeIndex + 1}`);
          activeIndex = prevActive;
        } else {
          region.push(activeIndex);
          commentOpen = !commentOpen;
        }
        if (region.length === 2) {
          commentRegions.push([region[0], region[1]]);
          region = [];
        }
      }
      if (region.length === 1) {
        commentRegions.push([region[0], line.length]);
      }
      newLines.push(this.removeCommentRegions(line, commentRegions));
    }
    return newLines;
  }

  /**
   * Return a string whose content within the regions is removed
   * for each region; regions contain two elements: the index of
   * the first character to ignore, and the index of the last character
   * to ignore + 1, in the text string
   *
   * Example input (comment characters: '/!' and '!/'):
   * removeCommentRegions('Sour/!ce Academ!/y', [[4,17]])
   *
   * Example output:
   * 'Soury'
   *
   * @param text the text to be removed from
   * @param regions contains all the regions of comments
   * @returns {string}
   */
  public static removeCommentRegions(text: string, regions: [number, number][]) {
    let newString = '';
    let prevEnd = 0;
    regions.forEach(arr => {
      newString += text.slice(prevEnd, arr[0]);
      prevEnd = arr[1];
    });
    newString += text.slice(prevEnd, text.length);
    return newString;
  }

  /**
   * Return an array of the starting indices of the substring within the text string
   *
   * @param text
   * @param substring substring to search for
   * @returns {Array<number>}
   */
  public static findAllInstances(text: string, substring: string): number[] {
    const indices = [];
    let index = text.indexOf(substring);
    while (index !== -1) {
      indices.push(index);
      index = text.indexOf(substring, index + 1);
    }
    return indices;
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
