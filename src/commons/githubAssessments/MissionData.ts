import MissionMetadata from './MissionMetadata';
import MissionRepoData from './MissionRepoData';
import TaskData from './TaskData';

type MissionData = {
  missionRepoData: MissionRepoData;
  missionBriefing: string;
  missionMetadata: MissionMetadata;
  tasksData: TaskData[];
};

export default MissionData;
