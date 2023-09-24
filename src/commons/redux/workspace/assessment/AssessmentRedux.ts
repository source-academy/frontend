import { defaultAssessment } from "../WorkspaceReduxTypes";
import { createAssessmentSlice } from "./AssessmentBase";

export const { actions: assessmentActions, reducer: assessmentReducer } = createAssessmentSlice('assessment', defaultAssessment, {})
