import MissionMetadata from './MissionMetadata';
import MissionRepoData from './MissionRepoData';
import TaskData from './TaskData';

export default class MissionData {
  missionRepoData: MissionRepoData;
  missionBriefing: string = '';
  missionMetadata: MissionMetadata;
  tasksData: TaskData[] = [];

  constructor(
    missionRepoData: MissionRepoData,
    missionBriefing: string,
    missionMetadata: MissionMetadata,
    tasksData: TaskData[]
  ) {
    this.missionRepoData = missionRepoData;
    this.missionBriefing = missionBriefing;
    this.missionMetadata = missionMetadata;
    this.tasksData = tasksData;
  }
}
