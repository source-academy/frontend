import { Task } from './GameTaskTypes';

/**
 * The class encapsulates data on all the task ids
 * that players can optionally complete, and keeps track of
 * which tasks have already been completed.
 *
 * One of the components of game checkpoint.
 */
class GameTask {
  private task: Map<string, boolean>;
  private taskData: Map<string, [string, string]>;
  private totalNumOfTasks: number;
  private numOfCompletedTasks: number;

  constructor() {
    this.task = new Map<string, boolean>();
    this.taskData = new Map<string, [string, string]>();
    this.totalNumOfTasks = 0;
    this.numOfCompletedTasks = 0;
  }

  /**
   * Set a task to a boolean value.
   *
   * @param key key of the task
   * @param value boolean value to set to
   *
   */
  public setTask(key: string, value: boolean): void {
    const prevState = this.task.get(key);
    this.task.set(key, value);

    // Handle repeated calls
    if (prevState !== undefined && prevState !== value) {
      this.numOfCompletedTasks++;
    }
  }

  /**
   * Add a task tied to the given string.
   *
   * @param task the task containing the task id (key) and task data
   */
  public addTask(task: Task): void {
    const key = task.taskId;
    this.task.set(key, false);
    this.taskData.set(key, [task.title, task.description]);
    this.totalNumOfTasks++;
  }

  /**
   * Add multiple tasks.
   *
   * @param tasks the task containing the task ids (keys) and task data
   */
  public addTasks(tasks: Task[]): void {
    tasks.forEach(task => this.addTask(task));
  }

  /**
   * Check whether all the tasks are complete.
   */
  public isAllComplete(): boolean {
    return this.numOfCompletedTasks >= this.totalNumOfTasks;
  }

  /**
   * Check the state of a specific task.
   * If task is not present, will return undefined instead.
   *
   * @param key key of the task
   */
  public getTaskState(key: string): boolean | undefined {
    return this.task.get(key);
  }

  /**
   * Retrieve the data of a specific task.
   * If task is not present, will return undefined instead.
   *
   * @param key key of the task
   */
  public getTaskData(key: string): [string, string] | undefined {
    return this.taskData.get(key);
  }

  /**
   * Returns all the tasks.
   */
  public getAllTasks() {
    return this.task;
  }

  /**
   * Returns all the task data.
   */
  public getAllTaskData() {
    return this.taskData;
  }

  /**
   * Set the task to the given parameter directly.
   *
   * @param task map of keys (task ids) to values (boolean)
   * @param taskData map of keys (task ids) to values (task title, task description)
   */
  public setTasks(task: Map<string, boolean>, taskData: Map<string, [string, string]>) {
    this.task = task;
    this.taskData = taskData;
  }
}

export default GameTask;
