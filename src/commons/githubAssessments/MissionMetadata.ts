/**
 * An code representation of a GitHub-hosted mission's '.metadata' file.
 */
type MissionMetadata = {
  coverImage: string;
  kind: string;
  number: string;
  title: string;
  sourceVersion: number;
  dueDate: Date;

  reading: string;
  webSummary: string;
};

export default MissionMetadata;
