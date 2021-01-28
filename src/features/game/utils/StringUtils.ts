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
   * Give an array of lines with a
   * a subset of lines commented out
   * by specified comment characters,
   * return an array of lines with
   * commented-out lines and characters
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
      const openCommentIndex = lines[l].indexOf(openCommentChars);
      const closeCommentIndex = lines[l].indexOf(closeCommentChars);
      const openCommentFound = openCommentIndex !== -1;
      const closeCommentFound = closeCommentIndex !== -1;
      let newLine = '';
      if (commentOpen) {
        if (closeCommentFound) {
          if (openCommentFound && closeCommentIndex > openCommentIndex) {
            console.error('Comment not closed: Line ' + (l + 1));
          }
          commentOpen = openCommentFound;
          newLine = this.removeSingleLineComment(lines[l], closeCommentChars, false);
          newLine = this.removeSingleLineComment(newLine, openCommentChars);
        } else if (openCommentFound) {
          console.error('Comment not closed: Line ' + (l + 1));
        }
      } else {
        if (openCommentFound) {
          commentOpen = !closeCommentFound;
          if (closeCommentFound && openCommentIndex > closeCommentIndex) {
            console.error('Comment not closed: Line ' + (l + 1));
          }
          newLine = closeCommentFound
            ? lines[l].slice(0, openCommentIndex) +
              lines[l].slice(closeCommentIndex + closeCommentChars.length)
            : this.removeSingleLineComment(lines[l], openCommentChars);
        } else if (closeCommentFound) {
          console.error('Comment not opened: Line ' + (l + 1));
        } else {
          newLine = lines[l];
        }
      }
      newLines.push(newLine);
    }
    if (commentOpen) {
      console.error('Missing close comment at end of document');
    }
    return newLines;
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
