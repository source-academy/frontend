import { TaskDetail } from '../task/GameTaskTypes';
import StringUtils from '../utils/StringUtils';
import Parser from './Parser';

/**
 * This class parses the "tasks" paragraphs,
 * and creates the indicated tasks to be displayed
 * to the user on the Task Log.
 */
export default class TasksParser {
  /**
   * This function parses the strings and creates each task
   * based on three parameters:
   *
   * (1) The specified task id
   * (2) The title of the task
   * (3) The description of the task
   *
   * E.g.
   *
   * tasks
   *     taskTalkToScottie, Talk to Scottie, Have a chat with your best friend, Scottie!
   *     taskCheckScreen, Check the monitor, Go to your room and check for further instructions!
   *
   * @param taskDetails the CSV lines containing descriptions about the tasks
   */
  public static parse(taskDetails: string[]) {
    const tasks: TaskDetail[] = [];
    taskDetails.forEach(taskDetail => {
      const [taskId, title, desc] = StringUtils.splitWithLimit(taskDetail, ',', 2);
      const newTask: TaskDetail = {
        taskId: taskId,
        title: title,
        description: desc,
        visible: false
      };
      tasks.push(newTask);
    });
    Parser.checkpoint.tasks.addTasks(tasks);
  }
}
