/**
 * The class encapsulates data on all the objective ids
 * that players must complete and keeps track of which
 * objectives have already been completed.
 *
 * One of the components of game checkpoint.
 */
class GameObjective {
  private objective: Map<string, boolean>;
  private totalNumOfObjectives: number;
  private numOfCompletedObjectives: number;

  constructor() {
    this.objective = new Map<string, boolean>();
    this.totalNumOfObjectives = 0;
    this.numOfCompletedObjectives = 0;
  }

  /**
   * Set an objective to a boolean value.
   *
   * @param key key of the objective
   * @param value boolean value to set to
   */
  public setObjective(key: string, value: boolean): void {
    const prevState = this.objective.get(key);
    this.objective.set(key, value);
    // Handle repeated calls
    if (prevState !== undefined && prevState !== value) {
      this.numOfCompletedObjectives++;
    }
  }

  /**
   * Add an objective tied to the given string.
   *
   * @param key key of the objective
   */
  public addObjective(key: string): void {
    this.objective.set(key, false);
    this.totalNumOfObjectives++;
  }

  /**
   * Add multiple objectives.
   *
   * @param keys objective keys
   */
  public addObjectives(keys: string[]): void {
    keys.forEach(key => this.addObjective(key));
  }

  /**
   * Check whether all the objectives are complete.
   */
  public isAllComplete(): boolean {
    return this.numOfCompletedObjectives >= this.totalNumOfObjectives;
  }

  /**
   * Check the state of a specific objective.
   * If objective is not present, will return undefined instead.
   *
   * @param key key of the objective
   */
  public getObjectiveState(key: string): boolean {
    const objState = this.objective.get(key);
    if (objState === undefined) {
      throw new Error(`Cannot find objective with the given task id "${key}"`);
    }
    return objState;
  }

  /**
   * Returns all the objectives.
   */
  public getObjectives() {
    return this.objective;
  }

  /**
   * Set the objective to the given parameter directly.
   *
   * @param objective map of objective keys(string) to its value (boolean)
   */
  public setObjectives(objective: Map<string, boolean>) {
    this.objective = objective;
  }
}

export default GameObjective;
