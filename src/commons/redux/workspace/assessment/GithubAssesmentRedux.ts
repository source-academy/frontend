import { defaultEditorValue } from "src/commons/application/ApplicationTypes";

import { AssessmentState, createAssessmentSlice, getDefaultAssessmentState } from "./AssessmentBase";

export type GitHubAssessmentWorkspaceState = AssessmentState

export const defaultGithubAssessment: GitHubAssessmentWorkspaceState = {
  ...getDefaultAssessmentState([{
    breakpoints: [],
    filePath: undefined,
    highlightedLines: [],
    value: defaultEditorValue,
  }]),
  editorTestcases: []
}

export const { reducer: githubAssessmentReducer } = createAssessmentSlice('githubAssessment', defaultGithubAssessment, {})
