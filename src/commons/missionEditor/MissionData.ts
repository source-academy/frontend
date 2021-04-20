import MissionMetadata from './MissionMetadata';
import TaskData from './TaskData';

export default class MissionData {
  missionBriefing: string = '';
  missionMetadata: MissionMetadata;
  tasksData: TaskData[] = [];

  constructor(missionBriefing: string, missionMetadata: MissionMetadata, tasksData: TaskData[]) {
    this.missionBriefing = missionBriefing;
    this.missionMetadata = missionMetadata;
    this.tasksData = tasksData;
  }
}
