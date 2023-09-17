import { WorkspaceState } from 'src/commons/workspace/WorkspaceTypes';

export type GitHubAssessmentWorkspaceAttr = {
  hasUnsavedChanges: boolean;
};

export type GitHubAssessmentWorkspaceState = WorkspaceState & GitHubAssessmentWorkspaceAttr;
