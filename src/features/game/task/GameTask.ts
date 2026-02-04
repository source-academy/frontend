import { TaskDetail } from './GameTaskTypes';

/**
 * The class encapsulates data on all the task ids
 * that players can optionally complete, and keeps track of
 * which tasks have already been completed.
 *
 * One of the components of game checkpoint.
 */
class GameTask {
  private tasks: Map<string, boolean>;
  private taskDetails: Map<string, TaskDetail>;

  constructor() {
    this.tasks = new Map<string, boolean>();
    this.taskDetails = new Map<string, TaskDetail>();
  }

  /**
   * Set a task to a boolean value.
   *
   * @param key key of the task
   * @param value boolean value to set to
   *
   */
  public setTask(key: string, value: boolean): void {
    this.tasks.set(key, value);
  }

  /**
   * Indicate that the players should be able to see this task.
   *
   * @param key key of the task
   */
  public showTask(key: string): void {
    const prevDetail = this.taskDetails.get(key);

    // Handle repeated calls
    if (prevDetail !== undefined) {
      const newDetail: TaskDetail = {
        ...prevDetail,
        visible: true
      };
      this.taskDetails.set(key, newDetail);
    }
  }

  /**
   * Add a task tied to the given string.
   *
   * @param task the new task containing the task id (key) and task data
   */
  public addTask(newTask: TaskDetail): void {
    const key = newTask.taskId;
    this.tasks.set(key, false);
    this.taskDetails.set(key, newTask);
  }

  /**
   * Add multiple tasks.
   *
   * @param newTasks an array of tasks, each containing a task id (key) and task detail
   */
  public addTasks(newTasks: TaskDetail[]): void {
    newTasks.forEach(task => this.addTask(task));
  }

  /**
   * Check the state of a specific task.
   * If task is not present, will return undefined instead.
   *
   * @param key key of the task
   */
  public getTaskState(key: string): boolean {
    const taskState = this.tasks.get(key);
    if (taskState === undefined) {
      throw new Error(`Cannot find task with the given task id "${key}"`);
    }
    return taskState;
  }

  /**
   * Retrieve the data of a specific task.
   * If task is not present, will return undefined instead.
   *
   * @param key key of the task
   */
  public getTaskDetail(key: string): TaskDetail {
    const taskDetail = this.taskDetails.get(key);
    if (taskDetail === undefined) {
      throw new Error(`Cannot find task with the given task id "${key}"`);
    }
    return taskDetail;
  }

  /**
   * Returns all the tasks.
   */
  public getAllTasks(): Map<string, boolean> {
    return this.tasks;
  }

  /**
   * Returns all incomplete tasks.
   */
  public getAllIncompleteTasks(): Array<string> {
    const incompleteTasks: Array<string> = new Array<string>();
    for (const key of this.tasks.keys()) {
      if (!this.tasks.get(key) && this.taskDetails.get(key)?.visible) {
        incompleteTasks.push(key);
      }
    }
    return incompleteTasks;
  }

  /**
   * Returns all the task data, including the task id, title, description, and the state.
   */
  public getAllVisibleTaskData(): Array<[TaskDetail, boolean]> {
    const allVisibleTask: Array<[TaskDetail, boolean]> = new Array<[TaskDetail, boolean]>();
    for (const key of this.tasks.keys()) {
      const taskState = this.getTaskState(key);
      const taskDetail = this.getTaskDetail(key);
      if (taskState !== undefined && taskDetail !== undefined && taskDetail.visible) {
        allVisibleTask.push([taskDetail, taskState]);
      }
    }
    return allVisibleTask;
  }
}

export default GameTask;
