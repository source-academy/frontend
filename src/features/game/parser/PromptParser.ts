import { Prompt } from '../dialogue/GameDialogueTypes';
import StringUtils from '../utils/StringUtils';

/**
 * This class parses prompt and creates Prompt
 * objects stored that are stored in a DialogueLine
 */
export default class PromptParser {
  /**
   * Parses title and choice strings and returns a
   * Prompt object with this information
   * @param title title of prompt to give context
   * @param choices raw choice strings, eg ["Yes -> goto 4", "No -> goto 5"]
   * @returns {Prompt} returns prompt object with associated information
   */
  public static parsePrompt(title: string, choices: string[]): Prompt {
    const prompt = {
      promptTitle: title.split('prompt:')[1].trim(),
      choices: choices.map(this.splitChoice)
    };
    return prompt;
  }

  /**
   * Split a choice string into a Choice option and
   * PartName
   * @param rawChoice raw choice string, eg "Yes -> goto 4"
   * @returns {[string, string]} returns a 2-element array, the
   * first element a choice option and the second element the
   * corresponding goto
   */
  public static splitChoice(rawChoice: string): [string, string] {
    const choice = StringUtils.splitWithLimit(rawChoice, '->', 1);
    return [choice[0].trim(), choice[1].split(' ')[1].trim()];
  }
}
