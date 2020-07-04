import * as _ from 'lodash';

export default class StringUtils {
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
   * Split using punctuation and trim
   * Example: "cat,dog,   cow, goat" -> ["cat", "dog", "cow", "goat"]
   */
  public static splitByChar(line: string, splitCharacter: string) {
    return line.split(splitCharacter).map(phrase => phrase.trim());
  }

  /*
   * Capitalise first letter
   */
  public static capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

  /*
   * Turns snake case to capitalized case
   * Example: snake_case_to_capitalized -> Snake Case To Capitalized
   */
  public static toCapitalizedWords(name: string) {
    const words = name.match(/[A-Za-z][a-z]*/g) || [];

    return words.map(StringUtils.capitalize).join(' ');
  }
}
