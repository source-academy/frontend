import { Quest } from '../quest/GameQuestTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import StringUtils from '../utils/StringUtils';

/**
 * This class parses the "quests" paragraphs,
 * and creates the indicated quests to be displayed
 * to the user on the Quest Log.
 */
export default class QuestsParser {
  /**
   * This function parses the strings and creates each quest
   * based on two parameters:
   *
   * (1) The specified objective tied to the quest
   * (2) The quest description
   *
   * E.g.
   *
   * quests
   *     talkedToScottie, Talk to Scottie - your best friend.
   *     checkedScreen, Check the monitor in your room for further instructions.
   *
   * @param questDetails the CSV lines containing descriptions about the quests
   */
  public static parse(questDetails: string[]) {
    questDetails.forEach(questDetail => {
      const [objectiveId, title, desc] = StringUtils.splitByChar(questDetail, ',');
      const newQuest: Quest = {
        objectiveId: objectiveId,
        title: title,
        description: desc
      }
      GameGlobalAPI.getInstance().storeQuest(newQuest);
    });
  }
}
