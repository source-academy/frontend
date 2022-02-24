import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { Task } from '../task/GameTaskTypes';
import StringUtils from '../utils/StringUtils';

/**
 * This class parses the "tasks" paragraphs,
 * and creates the indicated tasks to be displayed
 * to the user on the Task Log.
 */
export default class TasksParser {
  /**
   * This function parses the strings and creates each task
   * based on two parameters:
   *
   * (1) The specified objective tied to the task
   * (2) The task description
   *
   * E.g.
   *
   * tasks
   *     talkedToScottie, Talk to Scottie - your best friend.
   *     checkedScreen, Check the monitor in your room for further instructions.
   *
   * @param taskDetails the CSV lines containing descriptions about the tasks
   */
  public static parse(taskDetails: string[]) {
    taskDetails.forEach(taskDetail => {
      const [objectiveId, title, desc] = StringUtils.splitByChar(taskDetail, ',');
      const newTask: Task = {
        objectiveId: objectiveId,
        title: title,
        description: desc
      };
      GameGlobalAPI.getInstance().storeTask(newTask);
    });
  }
}
