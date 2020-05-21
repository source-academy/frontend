import { action } from 'typesafe-actions';

import * as actionTypes from './actionTypes';

export const changeDateAssessment = (id: number, openAt: string, closeAt: string) =>
  action(actionTypes.CHANGE_DATE_ASSESSMENT, { id, openAt, closeAt });

export const deleteAssessment = (id: number) => action(actionTypes.DELETE_ASSESSMENT, id);

export const publishAssessment = (togglePublishTo: boolean, id: number) =>
  action(actionTypes.PUBLISH_ASSESSMENT, { id, togglePublishTo });

export const uploadAssessment = (file: File, forceUpdate: boolean) =>
  action(actionTypes.UPLOAD_ASSESSMENT, { file, forceUpdate });
