import { AssessmentType } from '../../commons/assessment/AssessmentTypes';

/**
 * Information on a Team, for a particular student submission
 * for a particular assessment. Used for display in the UI.
 */
export type TeamFormationOverview = {
  teamId: number;
  assessmentId: number;
  assessmentName: string;
  assessmentType: AssessmentType;
  studentIds: number[];
  studentNames: string[];
};
