/**
 * Represents a single task for a mission hosted in a GitHub repository.
 */
export type TaskData = {
  taskDescription: string;
  starterCode: string;
  savedCode: string;
};

/**
 * An code representation of a GitHub-hosted mission's '.metadata' file.
 */
export type MissionMetadata = {
  coverImage: string;
  kind: string;
  number: string;
  title: string;
  sourceVersion: number;
  dueDate: Date;

  reading: string;
  webSummary: string;
};

/**
 * Represents information about a GitHub repository containing a SourceAcademy mission.
 *
 * Contains sufficient information for two purposes:
 * 1. Retrieval of repository information
 * 2. Establishing proper display order on the Mission Listing page
 */
export type MissionRepoData = {
  repoOwner: string;
  repoName: string;
  dateOfCreation: Date;
};

/**
 * Represents the information relating to a single Mission.
 */
export type MissionData = {
  missionRepoData: MissionRepoData;
  missionBriefing: string;
  missionMetadata: MissionMetadata;
  tasksData: TaskData[];
};
