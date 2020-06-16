class GameObjective {
  private objective: Map<string, boolean>;
  private totalNumOfObjectives: number;
  private numOfCompletedObjectives: number;

  constructor() {
    this.objective = new Map<string, boolean>();
    this.totalNumOfObjectives = 0;
    this.numOfCompletedObjectives = 0;
  }

  public setObjective(key: string, value: boolean): void {
    const prevState = this.objective.get(key);
    this.objective.set(key, value);
    // Handle repeated calls
    if (prevState !== undefined && prevState === value) {
      this.numOfCompletedObjectives++;
    }
  }

  public addObjective(key: string): void {
    this.objective.set(key, false);
    this.totalNumOfObjectives++;
  }

  public addObjectives(keys: string[]): void {
    keys.forEach(key => this.addObjective(key));
  }

  public isAllComplete(): boolean {
    return this.numOfCompletedObjectives >= this.totalNumOfObjectives;
  }

  public getObjectiveState(key: string): boolean | undefined {
    return this.objective.get(key);
  }

  public getObjectives() {
    return this.objective;
  }

  public setObjectives(objective: Map<string, boolean>) {
    this.objective = objective;
  }
}

export default GameObjective;
