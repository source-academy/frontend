export default class TaskData {
  taskDescription: string = '';
  starterCode: string = '';
  savedCode: string = '';

  constructor(taskDescription: string, starterCode: string, savedCode: string) {
    this.taskDescription = taskDescription;
    this.starterCode = starterCode;
    this.savedCode = savedCode;
  }
}
