import { ActionCreator } from 'redux';
import * as actionTypes from './actionTypes';

export const uploadMaterial: ActionCreator<actionTypes.IAction> = (file: File) => ({
  type: actionTypes.UPLOAD_MATERIAL,
  payload: file
});
