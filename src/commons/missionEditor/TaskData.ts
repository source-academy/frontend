export default class TaskData {
  taskDescription: string = '';
  starterCode: string = '';

  constructor(taskDescription: string, starterCode: string) {
    this.taskDescription = taskDescription;
    this.starterCode = starterCode;
  }
}
