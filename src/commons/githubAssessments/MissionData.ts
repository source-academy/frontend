import { MissionMetadata } from './MissionMetadata';
import MissionRepoData from './MissionRepoData';
import TaskData from './TaskData';

export type MissionData = {
  missionRepoData: MissionRepoData;
  missionBriefing: string;
  missionMetadata: MissionMetadata;
  tasksData: TaskData[];
}
