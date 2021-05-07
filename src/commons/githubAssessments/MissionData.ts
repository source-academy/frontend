import MissionMetadata from './MissionMetadata';
import MissionRepoData from './MissionRepoData';
import TaskData from './TaskData';

/**
 * Represents the information relating to a single Mission.
 */
type MissionData = {
  missionRepoData: MissionRepoData;
  missionBriefing: string;
  missionMetadata: MissionMetadata;
  tasksData: TaskData[];
};

export default MissionData;
