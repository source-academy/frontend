import { action } from 'typesafe-actions';

import {
  CHANGE_DATE_ASSESSMENT,
  DELETE_ASSESSMENT,
  PUBLISH_ASSESSMENT,
  UPLOAD_ASSESSMENT
} from './GroundControlTypes';

export const changeDateAssessment = (id: number, openAt: string, closeAt: string) =>
  action(CHANGE_DATE_ASSESSMENT, { id, openAt, closeAt });

export const deleteAssessment = (id: number) => action(DELETE_ASSESSMENT, id);

export const publishAssessment = (togglePublishTo: boolean, id: number) =>
  action(PUBLISH_ASSESSMENT, { id, togglePublishTo });

export const uploadAssessment = (file: File, forceUpdate: boolean, assessmentConfigId: number) =>
  action(UPLOAD_ASSESSMENT, { file, forceUpdate, assessmentConfigId });
