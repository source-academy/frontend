/**
 * Represents information about a GitHub repository containing a SourceAcademy mission.
 * 
 * Contains sufficient information for two purposes:
 * 1. Retrieval of repository information
 * 2. Establishing proper display order on the Mission Listing page
 */
type MissionRepoData = {
  repoOwner: string;
  repoName: string;
  dateOfCreation: Date;
};

export default MissionRepoData;
