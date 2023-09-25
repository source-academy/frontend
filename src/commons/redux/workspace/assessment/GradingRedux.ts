import { PayloadAction } from '@reduxjs/toolkit';

import { defaultGradingState, SubmissionsTableFilters } from '../WorkspaceReduxTypes';
import { createAssessmentSlice } from './AssessmentBase';

export const { actions: gradingActions, reducer: gradingReducer } = createAssessmentSlice(
  'grading',
  defaultGradingState,
  {
    updateCurrentSubmissionId: {
      prepare: (currentSubmission: number, currentQuestion: number) => ({
        payload: { currentQuestion, currentSubmission }
      }),
      reducer(
        state,
        { payload }: PayloadAction<{ currentSubmission: number; currentQuestion: number }>
      ) {
        state.currentQuestion = payload.currentQuestion;
        state.currentSubmission = payload.currentSubmission;
      }
    },
    updateSubmissionsTableFilters(state, { payload }: PayloadAction<SubmissionsTableFilters>) {
      state.submissionsTableFilters = payload;
    }
  }
);
