export default class StringUtils {
  /*
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
   */

  /**
   * @param lines raw text strings
   * @returns several parargraphs that have been split into head and body
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

  /*
   * Given an array of lines, returns a Map where the keys are the headings
   * and the value are the lines below each heading.
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

  /*
   * Split using punctuation, trim, and limit split to number of characters
   * Example: "cat,dog,   cow, goat" with limit 2 -> ["cat", "dog", "cow, goat"]
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

  /*
   * Splits text into string array and removes lines with only newlines
   */
  public static splitToLines(text: string): string[] {
    return text
      .split('\n')
      .map(line => line.trimRight())
      .filter(line => line !== '');
  }

  /*
   * Capitalise first letter
   */
  public static capitalize(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  /*
   * Turns snake case to capitalized case
   * Example: snake_case_to_capitalized -> Snake Case To Capitalized
   */
  public static toCapitalizedWords(name: string) {
    const words = name.match(/[A-Za-z][a-z]*/g) || [];

    return words.map(StringUtils.capitalize).join(' ');
  }
}
