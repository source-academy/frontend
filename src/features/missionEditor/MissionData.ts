import TaskData from './TaskData';

export default class MissionData {
  missionBriefing: string = '';
  missionMetadata: string = '';
  tasksData: TaskData[] = [];

  constructor(missionBriefing: string, missionMetadata: string, tasksData: TaskData[]) {
    this.missionBriefing = missionBriefing;
    this.missionMetadata = missionMetadata;
    this.tasksData = tasksData;
  }
}
