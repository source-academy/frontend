export default class StringUtils {
  
  /**
   * Splits text into paragraphs containing header and body
   * 
   * @param lines lines to be processed
   * @returns Array<[string, string[]]>
   */
  public static splitToParagraph(lines: string[]) {
    const paragraphHeaderAndBodyLines: [string, string[]][] = [];
    lines.forEach((line: string) => {
      if (line.startsWith('\t') || line.startsWith('    ')) {
        const content = line.startsWith('\t') ? line.slice(1) : line.slice(4);
        if (paragraphHeaderAndBodyLines.length === 0) {
          console.error('Unexpected tabs');
          return;
        }
        const bodyLines = paragraphHeaderAndBodyLines[paragraphHeaderAndBodyLines.length - 1][1];
        bodyLines.push(content);
        return;
      }
      paragraphHeaderAndBodyLines.push([line.trim(), []]);
    });
    return paragraphHeaderAndBodyLines;
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
   * TODO: Clarify
   * Split using punctuation, trim, and limit split to number of characters
   * e.g "cat,dog,   cow, goat" with limit 2 -> ["cat", "dog", "cow, goat"]
   * 
   * @param line line to be split
   * @param sep separator to be used
   * @param limit
   * @param {Array<string>}
   */
  public static splitByChar(line: string, sep: string, limit?: number): string[] {
    if (limit) {
      return line
        .split(new RegExp((sep + '(.+)').repeat(limit)))
        .map((phrase: string) => phrase.trim());
    } else {
      return line.split(sep).map((phrase: string) => phrase.trim());
    }
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
}
