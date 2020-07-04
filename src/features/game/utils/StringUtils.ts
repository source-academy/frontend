export default class StringUtils {
  /*
   * Splits text into paragraphs containing header and body
   */
  public static splitToParagraph(lines: string[]) {
    const splitToParagraph: [string, string[]][] = [];
    lines.forEach((line: string) => {
      if (line.startsWith('\t') || line.startsWith('    ')) {
        const content = line.startsWith('\t') ? line.slice(1) : line.slice(4);
        if (splitToParagraph.length === 0) {
          console.error('Unexpected tabs');
          return;
        }
        splitToParagraph[splitToParagraph.length - 1][1].push(content);
        return;
      }
      splitToParagraph.push([line.trim(), []]);
    });
    return splitToParagraph;
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
      const arr = line.split(sep);
      const rest = arr.splice(0, limit);
      rest.push(arr.join(' '));
      return rest.map((phrase: string) => phrase.trim());
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
