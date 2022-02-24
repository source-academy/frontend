//import ChapterSelect from '../scenes/chapterSelect/ChapterSelect';
//import chapConstants, { chapterIndexStyle, chapterTitleStyle } from './ChapterSelectConstants';
//import GameLayerManager from '../../layer/GameLayerManager';
import SourceAcademyGame from '../SourceAcademyGame';

/**
 * The class encapsulates data on all the tasks ids
 * that players CAN complete and keeps track of which
 * tasks have already been completed.
 *
 * One of the components of game checkpoint.
 */
class GameTask {
  private task: Map<string, boolean>;
  private description: string;
  private totalNumOfTasks: number;
  private numOfCompletedTasks: number;

  constructor() {
    this.task = new Map<string, boolean>();
    this.description = '';
    this.totalNumOfTasks = 0;
    this.numOfCompletedTasks = 0;
  }

  /**
   * Set a task to a boolean value.
   *
   * @param key key of the task
   * @param value boolean value to set to
   * @param desc description of the task
   *
   */
  public setTask(key: string, value: boolean, desc: string): void {
    const prevState = this.task.get(key);
    this.task.set(key, value);
    this.description = desc;
    // Handle repeated calls
    if (prevState !== undefined && prevState !== value) {
      this.numOfCompletedTasks++;
    }
  }

  /**
   * Add a task tied to the given string.
   *
   * @param key key of the task
   * @param desc description of the task
   */
  public addTask(key: string, desc: string): void {
    this.task.set(key, false);
    this.description = desc;
    this.totalNumOfTasks++;
  }

  /**
   * Add multiple tasks.
   *
   * @param keys task keys
   * @param descriptions task descriptions
   */
  public addTasks(keys: string[], descriptions: string[]): void {
    //keys.forEach(key => this.addTask(key));
    let i: number = 0;
    while (i < keys.length) {
      this.addTask(keys[i], descriptions[i]);
      i++;
    }
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
   * Returns all the tasks.
   */
  public getTasks() {
    return this.task;
  }

  /** Returns description of a task*/
  public getDescription(key: string): string | '' {
    return this.description;
  }

  /** Returns tasks so far */
  public getTasksSoFar(index: number): string[] | null {
    const tasksSoFar = SourceAcademyGame.getInstance()
      .getSaveManager()
      .getChapterSaveState(index).completedTasks;
    return tasksSoFar;
  }

  /**
   * Set the task to the given parameter directly.
   *
   * @param task map of task keys(string) to its value (boolean)
   * @param desc description of the task
   */
  public setTasks(task: Map<string, boolean>, desc: string) {
    this.task = task;
    this.description = desc;
  }
}

export default GameTask;
