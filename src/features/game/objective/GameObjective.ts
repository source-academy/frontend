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
    if (prevState !== undefined && prevState === value) {
      this.numOfCompletedObjectives++;
    }
  }

  public addObjective(key: string): void {
    this.objective.set(key, false);
    this.totalNumOfObjectives++;
  }

  public isAllComplete(): boolean {
    return this.numOfCompletedObjectives >= this.totalNumOfObjectives;
  }

  public getObjectiveState(key: string): boolean | undefined {
    return this.objective.get(key);
  }
}

export default GameObjective;
