import { defaultGithubAssessment } from "../WorkspaceReduxTypes";
import { createAssessmentSlice } from "./AssessmentBase";

export const { reducer: githubAssessmentReducer } = createAssessmentSlice('githubAssessment', defaultGithubAssessment, {})
