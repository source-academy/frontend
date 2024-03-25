import { createAction } from '@reduxjs/toolkit';

import {
  CHANGE_DATE_ASSESSMENT,
  DELETE_ASSESSMENT,
  PUBLISH_ASSESSMENT,
  PUBLISH_GRADING_ALL,
  UNPUBLISH_GRADING_ALL,
  UPLOAD_ASSESSMENT
} from './GroundControlTypes';

export const changeDateAssessment = createAction(
  CHANGE_DATE_ASSESSMENT,
  (id: number, openAt: string, closeAt: string) => ({ payload: { id, openAt, closeAt } })
);

export const deleteAssessment = createAction(DELETE_ASSESSMENT, (id: number) => ({ payload: id }));

export const publishAssessment = createAction(
  PUBLISH_ASSESSMENT,
  (togglePublishAssessmentTo: boolean, id: number) => ({
    payload: { id, togglePublishAssessmentTo }
  })
);

export const publishGradingAll = createAction(PUBLISH_GRADING_ALL, (id: number) => ({
  payload: id
}));

export const unpublishGradingAll = createAction(UNPUBLISH_GRADING_ALL, (id: number) => ({
  payload: id
}));

export const uploadAssessment = createAction(
  UPLOAD_ASSESSMENT,
  (file: File, forceUpdate: boolean, assessmentConfigId: number) => ({
    payload: { file, forceUpdate, assessmentConfigId }
  })
);
