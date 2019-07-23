import { ActionCreator } from 'redux';
import * as actionTypes from './actionTypes';

export const uploadMaterial: ActionCreator<actionTypes.IAction> = (
  file: File,
  title: string,
  description: string
) => ({
  type: actionTypes.UPLOAD_MATERIAL,
  payload: { file, title, description }
});
