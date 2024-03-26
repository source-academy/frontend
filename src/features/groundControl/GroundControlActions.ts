import { createAction } from '@reduxjs/toolkit';

import {
  CHANGE_DATE_ASSESSMENT,
  CHANGE_TEAM_SIZE_ASSESSMENT,
  CONFIGURE_ASSESSMENT,
  DELETE_ASSESSMENT,
  PUBLISH_ASSESSMENT,
  UPLOAD_ASSESSMENT
} from './GroundControlTypes';

export const changeDateAssessment = createAction(
  CHANGE_DATE_ASSESSMENT,
  (id: number, openAt: string, closeAt: string) => ({ payload: { id, openAt, closeAt } })
);

export const changeTeamSizeAssessment = createAction(
  CHANGE_TEAM_SIZE_ASSESSMENT,
  (id: number, maxTeamSize: number) => ({ payload: { id, maxTeamSize } })
);

export const deleteAssessment = createAction(DELETE_ASSESSMENT, (id: number) => ({ payload: id }));

export const publishAssessment = createAction(
  PUBLISH_ASSESSMENT,
  (togglePublishTo: boolean, id: number) => ({ payload: { id, togglePublishTo } })
);

export const uploadAssessment = createAction(
  UPLOAD_ASSESSMENT,
  (file: File, forceUpdate: boolean, assessmentConfigId: number) => ({
    payload: { file, forceUpdate, assessmentConfigId }
  })
);

export const configureAssessment = createAction(
  CONFIGURE_ASSESSMENT,
  (id: number, hasVotingFeatures: boolean, hasTokenCounter: boolean) => ({
    payload: { id, hasVotingFeatures, hasTokenCounter }
  })
);
